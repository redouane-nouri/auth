import { getUserSignInSchema } from "@/utils/functions";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getTranslations } from "next-intl/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: process.env.AUTH_BASEPATH,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        //TODO: Credential authz logic here
      },
    }),
  ],
  pages: {
    signIn: "/connect",
  },
});
