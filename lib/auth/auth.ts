import { getSignInWithCredentialsSchema } from "@/utils/functions";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { encode } from "next-auth/jwt";
import { getTranslations } from "next-intl/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prisma/prisma-client";
import bcrypt from "bcrypt";
import { createTransport, Transporter } from "nodemailer";
import { render } from "@react-email/render";
import EmailHtml from "@/components/auth/EmailHtml";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import React from "react";
import {
  AUTH_CREDENTIALS_PROVIDER_NAME,
  AUTH_ERROR_ENDPOINT,
  AUTH_NEW_USER_ENDPOINT,
  AUTH_SIGNIN_ENDPOINT,
  AUTH_SIGNOUT_ENDPOINT,
  AUTH_VERIFY_REQUEST_ENDPOINT,
  AUTH_LOGIN_EMAIL_SUBJECT,
  AUTH_NODEMAILER_OAUTH2_TYPE,
} from "@/utils/constants";
/*
  Customizable code message to show the user in credentials authentication
*/
class CredentialsSigninError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}
/*
  Type of the credentials var passed to the authorize method
*/
type CredentialsT = {
  email: string;
  password: string;
  csrfToken: string;
  callbackUrl: string;
};

/*
  Email Text body (fallback for email clients that don't render HTML)
*/
function emailText(url: string, host: string): string {
  return `Sign in to ${host}\n${url}\n\n`;
}
/*
  Use one transporter instance
*/
let transporter: Transporter | null = null;
/*
  Prisma Adapter to store and control our own auth information
*/
const prismaAdapter = PrismaAdapter(prisma);
/*
  Session duration
*/
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
/*
  Authjs configuration
*/
export const { handlers, signIn, signOut, auth } = NextAuth({
  /*
    To be able to configure our own ednpoint (/api/v1/auth) instead of (/api/auth)
  */
  basePath: process.env.AUTH_BASEPATH,
  /*
    Prisma adapter to control our own db
  */
  adapter: prismaAdapter,
  /*
    Callback configuration
  */
  callbacks: {
    /*
      Even we specefied an adapter which authjs automatically uses the "database" strategy, for credentials it uses a "jwt" strategy.
      So if we want to use "database" strategy for a credentials provider, we need to tag the token as coming from credentials provider and modify it in the next step inside the encode method to use a session token.
    */
    async jwt({ token, account }) {
      if (account?.provider === AUTH_CREDENTIALS_PROVIDER_NAME)
        token.credentials = true;
      return token;
    },
  },
  jwt: {
    encode: async function(params) {
      /*
        If not a credentials auth, then just perform the default jwt encoding.
      */
      if (!params.token?.credentials) return encode(params);
      /*
        Get user Id
      */
      const userId = params.token.sub;
      /*
        Throw an error if no ID was provided
      */
      if (!userId) throw new Error("User not found");
      /*
        Create a session token
      */
      const sessionToken = uuidv4();
      /*
        Create a session record in our DB
      */
      const createdSession = await prismaAdapter.createSession?.({
        sessionToken,
        userId,
        expires: new Date(Date.now() + THIRTY_DAYS),
      });
      /*
        Throw an error of the creation failed
      */
      if (!createdSession) throw new Error("Session creation failed");
      /*
        Return the session token created
      */
      return sessionToken;
    },
  },
  /*
    Providers configuration
  */
  providers: [
    Google({ allowDangerousEmailAccountLinking: process.env.AUTH_ALLOW_GOOGLE_DANGEROUS_EMAIL_ACCOUNT_LINKING === "true" }),
    GitHub({ allowDangerousEmailAccountLinking: process.env.AUTH_ALLOW_GITHUB_DANGEROUS_EMAIL_ACCOUNT_LINKING === "true" }),
    /*
      Configure the Nodemailer provider for signin with magic links suing the .env file
    */
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: process.env.EMAIL_SERVER_SECURE === "true",
        auth: {
          type: AUTH_NODEMAILER_OAUTH2_TYPE,
          user: process.env.EMAIL_SERVER_AUTH_USER,
          clientId: process.env.EMAIL_SERVER_AUTH_CLIENT_ID,
          clientSecret: process.env.EMAIL_SERVER_AUTH_CLIENT_SECRET,
          refreshToken: process.env.EMAIL_SERVER_AUTH_REFRESH_TOKEN,
        },
      },
      from: process.env.EMAIL_FROM,
      /*
        Configurable function to send email
      */
      async sendVerificationRequest({ identifier, url, provider }) {
        /*
          Check if the user exists with email provided
        */
        const user = await prisma.user.findUnique({
          where: { email: identifier },
        });
        /*
          If no user just silent return wihtou any hints (it will look like a success but we won't send a login link for unregistered user)
        */
        if (!user) {
          return;
        }
        /*
          Extract the host from url
        */
        const { host } = new URL(url);
        /*
          If no  nodemailer transporter found, create one
        */
        if (!transporter) transporter = createTransport(provider.server);
        /*
          Send the email
        */
        const result = await transporter.sendMail({
          to: identifier,
          from: provider.from,
          subject: AUTH_LOGIN_EMAIL_SUBJECT,
          text: emailText(url, host),
          html: await render(
            React.createElement(EmailHtml, {
              url,
              host,
            })
          ),
        });
        /*
          reject and pending are arrays where nodemailer puts the email addresses that are not accepted (accepted var contains an array with accepted email addresses)
        */
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        /*
          If there are email addresses failed, throw an error.
        */
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
    Credentials({
      /*
        Used for the default login page, since we use our own page, just provide the params we need with empty conf.
      */
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        try {
          /*
            Get transaltions function
          */
          const t = await getTranslations("signinValidation");
          /*
            If user already signed in throw an error with already signed in message
          */
          if (await auth())
            throw new CredentialsSigninError(t("alreadySignedIn"));
          /*
            Extract email and password
          */
          const { email, password } = credentials as CredentialsT;
          /*
            Get tuser sigin schema
          */
          const userSigninSchema = getSignInWithCredentialsSchema(t);
          /*
            Validate email and password through signin schema
          */
          const result = userSigninSchema.safeParse({ email, password });
          /*
            If the validation failed throw an error
          */
          if (!result.success) throw new CredentialsSigninError(t("error"));
          /*
            Search for a user with the email provided and select only needed attributes
          */
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              password: true,
            },
          });
          /*
            If the user not found or the password is not set (which means credentials auth is not configured) then throw an error
          */
          if (!user || !user.password)
            throw new CredentialsSigninError(t("invalidCredentials"));
          /*
            Extract the hashed password and the user data needed to be in the session
          */
          const { password: hashedPassword, ...userData } = user;
          /*
            Get the password row and hashed comparaison result
          */
          const correctPassword = await bcrypt.compare(
            password,
            hashedPassword
          );
          /*
            If the comparaison is false then throw an error
          */
          if (!correctPassword)
            throw new CredentialsSigninError(t("invalidCredentials"));
          /*
            All good, return the user data (id, email, name, image)
          */
          return userData;
        } catch (e) {
          /*
            If the error is one of the errors thrown above, then just pass it
          */
          if (e instanceof CredentialsSigninError) throw e;
          /*
            Else, throw a CredentialsSigninError with "error" message 
          */
          throw new CredentialsSigninError("error");
        }
      },
    }),
  ],
  /*
    Our own pages endpoints
  */
  pages: {
    signIn: AUTH_SIGNIN_ENDPOINT,
    error: AUTH_ERROR_ENDPOINT,
    verifyRequest: AUTH_VERIFY_REQUEST_ENDPOINT,
    signOut: AUTH_SIGNOUT_ENDPOINT,
    newUser: AUTH_NEW_USER_ENDPOINT,
  },
});
