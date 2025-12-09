import { getUserSignInSchema } from "@/utils/functions";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getTranslations } from "next-intl/server";
import prisma from "../prisma/prisma-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: process.env.AUTH_BASEPATH,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        //TODO: Credential authz logic here
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/connect",
  },
});
