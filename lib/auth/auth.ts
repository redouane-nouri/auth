import { getUserSignInSchema } from "@/utils/functions";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getTranslations } from "next-intl/server";
import prisma from "../prisma/prisma-client";
import bcrypt from "bcrypt";

class CredentialsSigninError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

type CredentialsT = {
  email: string;
  password: string;
  csrfToken: string;
  callbackUrl: string;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: process.env.AUTH_BASEPATH,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        /*
          Extract email and password
        */
        const { email, password } = credentials as CredentialsT;

        try {
          /*
            Get transaltions function
          */
          const t = await getTranslations("signinValidation");
          /*
            Get tuser sigin schema
          */
          const userSigninSchema = getUserSignInSchema(t);
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
    Our pages endpoints
  */
  pages: {
    signIn: "/connect",
  },
});
