import { getUserSignInSchema } from "@/utils/functions";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getTranslations } from "next-intl/server";
import prisma from "../prisma/prisma-client";

class CredentialsSigninError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: process.env.AUTH_BASEPATH,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        throw new CredentialsSigninError("TODO");
      },
    }),
  ],
  pages: {
    signIn: "/connect",
  },
});
