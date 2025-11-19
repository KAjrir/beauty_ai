import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

import { prisma } from "@/database/prisma/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"

import { v4 } from "uuid"
import { compare } from "bcryptjs"

const adapter = PrismaAdapter(prisma)

const credits = Credentials({
      authorize: async (credentials) => {
        try{
          const user = await prisma.user.findUnique({
            where: {email: credentials.email}
          })
          console.log("@/auth.js (22): ", user)
  
          const isPasswordValid = await compare(
            credentials.password.toString(),
            user.password,
          );
  
          if (!isPasswordValid || !user) {
            return null
          }
  
          return {
            id: user.id,
            name: user?.name,
            email: user.email,
          }
        }catch(err){
          console.error(err)
          return null
        }
      }
    })
  

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  debug: false,
  providers: [Google, credits],
  events: {
    
  },
  session: {
    strategy: 'database',
    maxAge: 1 * 24 * 60 * 60
  },
  pages: {
    // signIn: "/sign-in"
  },
  callbacks: {
    async jwt({ token, user, account }) {
        if (account?.provider === "credentials") {
          token.credentials = true
        }
        return token;
      },
    },
  jwt: {
    encode: async function (params) {
      console.log(params)
      if(!params.token || !params.token.sub){
          return ""
      }

      if(params.token.credentials){
        const sessionToken = v4()

        await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        })

        return sessionToken

      }
      return defaultEncode(params)
    }
  },
  secret: process.env.AUTH_SECRET
});