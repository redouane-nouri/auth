import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [ Credentials({
    credentials: {email:{}, pasword:{}},
    authorize: async (credentials) => {
      return null;
    },
  }),],
  pages:{
    signIn: '/connect',
  }
})