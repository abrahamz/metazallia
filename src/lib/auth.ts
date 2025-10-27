import type { NextAuthOptions } from 'next-auth/'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 5 *60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.isAdmin = token.isAdmin as boolean
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      firstName: string
      lastName: string
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    username: string
    firstName: string
    lastName: string
    isAdmin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin: boolean
    firstName: string
    lastName: string
  }
}
