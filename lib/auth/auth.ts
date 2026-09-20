import { getClientIp, getSignInWithCredentialsSchema } from "@/utils/functions";
import { after } from "next/server";
import {
  credentialsSignInEmailRateLimiter,
  credentialsSignInIpRateLimiter,
  emailSignInEmailRateLimiter,
  emailSignInIpRateLimiter,
  isRateLimited,
} from "@/lib/rateLimiter/rateLimiter";
import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth";
import type { Adapter, AdapterSession } from "next-auth/adapters";
import type { JWTOptions } from "next-auth/jwt";
import Credentials, {
  type CredentialsConfig,
} from "next-auth/providers/credentials";
import Nodemailer, {
  type NodemailerConfig,
} from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { encode } from "next-auth/jwt";
import {
  getCachedSessionAndUser,
  invalidateCachedSession,
  setCachedSessionAndUser,
} from "@/lib/redis/sessionCache";
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
const baseAdapter = PrismaAdapter(prisma);

export const prismaAdapter: Adapter = {
  ...baseAdapter,
  async getSessionAndUser(sessionToken) {
    const cached = await getCachedSessionAndUser(sessionToken);
    if (cached) return cached;

    const result = await baseAdapter.getSessionAndUser?.(sessionToken);
    if (result) await setCachedSessionAndUser(sessionToken, result);
    return result ?? null;
  },
  async updateSession(session) {
    const updated = await baseAdapter.updateSession?.(session);
    await invalidateCachedSession(session.sessionToken);
    return updated;
  },
  async deleteSession(
    sessionToken,
  ): Promise<AdapterSession | null | undefined> {
    const deleted = await baseAdapter.deleteSession?.(sessionToken);
    await invalidateCachedSession(sessionToken);
    return deleted as AdapterSession | null | undefined;
  },
};
/*
  Session duration
*/
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
/*
  A precomputed hash with no matching password, used to run bcrypt.compare even when no user/password
  is found, so the response time doesn't reveal whether the email is registered (timing side-channel).
*/
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  uuidv4(),
  Number(process.env.BCRYPT_HASH_ROUNDS),
);
/*
  Even we specefied an adapter which authjs automatically uses the "database" strategy, for credentials it uses a "jwt" strategy.
  So if we want to use "database" strategy for a credentials provider, we need to tag the token as coming from credentials provider and modify it in the next step inside the encode method to use a session token.
*/
export const jwtCallback: NonNullable<
  NonNullable<NextAuthConfig["callbacks"]>["jwt"]
> = async ({ token, account }) => {
  if (account?.provider === AUTH_CREDENTIALS_PROVIDER_NAME)
    token.credentials = true;
  return token;
};
/*
  Overrides the default jwt encoding to hand credentials sign-ins a real DB backed session token,
  instead of the default self-contained JWT, so credentials sessions can be looked up/revoked/cached
  the same way as OAuth/email sessions are.
*/
export const encodeSessionToken: JWTOptions["encode"] = async (params) => {
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
};
/*
  Sends the magic sign-in link email for the Nodemailer provider.
*/
export const sendVerificationRequest: NodemailerConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider, request }) => {
    /*
      Limit sign-in emails per IP and per email address.
    */
    if (
      (await isRateLimited(emailSignInIpRateLimiter, getClientIp(request))) ||
      (await isRateLimited(emailSignInEmailRateLimiter, identifier))
    )
      throw new Error("Too many requests");
    /*
     use with 'after' so the response doesn't wait on the user lookup/email send, otherwise the response
     latency alone would reveal whether this email is registered (timing side-channel).
    */
    after(() => sendSignInEmail({ identifier, url, provider }));
  };
/*
  Looks up the user and, if he exists, emails him the magic sign-in link. If not, deletes the
  verification token next-auth's adapter already created for this email, so it can't be used.
*/
async function sendSignInEmail({
  identifier,
  url,
  provider,
}: Pick<
  Parameters<NodemailerConfig["sendVerificationRequest"]>[0],
  "identifier" | "url" | "provider"
>) {
  try {
    /*
      Check if the user exists with email provided
    */
    const user = await prisma.user.findUnique({
      where: { email: identifier },
    });
    /*
      If no user delete the created token and silent return wihtout any hints (it will look like a success but we won't send a login link for unregistered user)
    */
    if (!user) {
      /*
        Delete the created token
      */
      await prisma.verificationToken.deleteMany({
        where: { identifier },
      });

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
    await transporter.sendMail({
      to: identifier,
      from: provider.from,
      subject: AUTH_LOGIN_EMAIL_SUBJECT,
      text: emailText(url, host),
      html: await render(
        React.createElement(EmailHtml, {
          url,
          host,
        }),
      ),
    });
  } catch {
    /*
      The response was already sent by the time this runs, there is no one left to report the error to
    */
  }
}
/*
  Handles the Credentials provider sign-in: rate limiting, input validation, and a timing-safe
  password check against the DB.
*/
export const authorizeCredentials: CredentialsConfig["authorize"] = async (
  credentials,
  request,
) => {
  /*
    Get transaltions function, needs to be outside the try block below so it is still in scope for the catch block's error message
  */
  const t = await getTranslations("signinValidation");
  try {
    /*
      Limit sign-in attempts per IP
    */
    if (
      await isRateLimited(credentialsSignInIpRateLimiter, getClientIp(request))
    )
      throw new CredentialsSigninError(t("tooManyRequests"));
    /*
      If user already signed in throw an error with already signed in message
    */
    if (await auth()) throw new CredentialsSigninError(t("alreadySignedIn"));
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
      Limit sign-in attempts per email, on top of the IP limit above
    */
    if (
      await isRateLimited(credentialsSignInEmailRateLimiter, result.data.email)
    )
      throw new CredentialsSigninError(t("tooManyRequests"));
    /*
      Search for a user with the email provided and select only needed attributes
    */
    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
      },
    });
    /*
      Extract the hashed password and the user data needed to be in the session
    */
    const { password: hashedPassword, ...userData } = user ?? {};
    /*
      Always run bcrypt.compare, against the real hash if we have one or a dummy hash otherwise,
      so a missing user/password takes the same time as a wrong password (avoids a timing side-channel).
    */
    const correctPassword = await bcrypt.compare(
      password,
      hashedPassword ?? DUMMY_PASSWORD_HASH,
    );
    /*
      If the user not found, the password is not set (which means credentials auth is not configured), or the comparaison is false then throw an error
    */
    if (!user || !user.password || !correctPassword)
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
    throw new CredentialsSigninError(t("error"));
  }
};
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
    jwt: jwtCallback,
  },
  jwt: {
    encode: encodeSessionToken,
  },
  /*
    Providers configuration
  */
  providers: [
    Google({
      allowDangerousEmailAccountLinking:
        process.env.AUTH_ALLOW_GOOGLE_DANGEROUS_EMAIL_ACCOUNT_LINKING ===
        "true",
    }),
    GitHub({
      allowDangerousEmailAccountLinking:
        process.env.AUTH_ALLOW_GITHUB_DANGEROUS_EMAIL_ACCOUNT_LINKING ===
        "true",
    }),
    /*
      Configure the Nodemailer provider for signin with magic links using the .env file
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
      sendVerificationRequest,
    }),
    Credentials({
      /*
        Used for the default login page, since we use our own page, just provide the params we need with empty conf.
      */
      credentials: { email: {}, password: {} },
      authorize: authorizeCredentials,
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
