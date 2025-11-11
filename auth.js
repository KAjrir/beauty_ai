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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {email: credentials.email}
        })
        console.log(user)

        if (!user || !user?.password) return null;

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user.password,
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user?.name,
          email: user.email,
        }
      }
    })
  

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  debug: false,
  providers: [Google, credits],
  events: {
    async signIn ({user, account}) {
      console.log("REGEL 49: ", user)
      console.log("REGEL 50: ", account)
      const freeplan = await prisma.plan.findUnique({
        where: { name: 'free' }
      });

      console.log(freeplan)
      const existingUser = await prisma.user.findUnique({
        where: {id: user.id},
        include: {
          subscription: true
        }
      })

    }
  },
  session: {
    strategy: 'database',
    maxAge: 1 * 24 * 60 * 60
  },
  pages: {
    signIn: "/sign-in"
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
      if(params.token?.credentials){
        const sessionToken = v4()
        
        if(!params.token.sub){
          throw new Error("No user ID found in token")
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        })

        if (!createdSession) {
          throw new Error("Failed to create session")
        }

        return sessionToken

      }
      return defaultEncode(params)
    }
  },
  secret: process.env.AUTH_SECRET,
  // events: {
  //   async signIn({ user, account }) {
  //     // 🔁 Alles wat NextAuth standaard doet, gebeurt al automatisch
  //     const plan = await prisma.plan.findUnique({
  //           where: { name: 'free' },
  //       });
  //     // ✅ Nu jouw extra actie erbovenop:
  //     const user = await prisma.user.create({
  //           data: {
  //               email,
  //               password: hashedPassword,
  //               subscription: {
  //                   create: {
  //                       plan: {
  //                           connect: {id: plan.id}
  //                       },
  //                       endDate: new Date()
  //                   }
  //               }
  //           }
  //       })

  //     // optioneel: andere logging, analytics, enz.
  //   }
  // }
});