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
import { createTransport } from "nodemailer";
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
function html(params: { url: string; host: string; theme: any }) {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor || "#346df1";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || "#fff",
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
/*
  Prisma Adapter to store and control our own auth information
*/
const prismaAdapter = PrismaAdapter(prisma);
/*
  Session duration
*/
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  /*
    To be able to configure our own ednpoint (/api/v1/auth) instead of (/api/auth)
  */
  basePath: process.env.AUTH_BASEPATH,
  /*
    Prisma adapter to control our own db
  */
  adapter: prismaAdapter,
  callbacks: {
    /*
      Even we specefied an adapter which authjs automatically uses the "database" strategy, for credentials it uses a "jwt" strategy.
      So if we want to use "database" strategy for a credentials provider, we need to tag the token as coming from credentials provider and modify it in the next step inside the encode method to use a session token.
    */
    async jwt({ token, account }) {
      if (account?.provider === "credentials") token.credentials = true;
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
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
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: process.env.EMAIL_SERVER_SECURE === "true",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL_SERVER_AUTH_USER,
          clientId: process.env.EMAIL_SERVER_AUTH_CLIENT_ID,
          clientSecret: process.env.EMAIL_SERVER_AUTH_CLIENT_SECRET,
          refreshToken: process.env.EMAIL_SERVER_AUTH_REFRESH_TOKEN,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider, theme }) {
        const user = await prisma.user.findUnique({
          where: { email: identifier },
        });

        if (!user) {
          console.log("***********************");
          return;
        }

        const { host } = new URL(url);
        const transport = createTransport(provider.server);
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, theme }),
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
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
    signIn: "/connect",
  },
});
