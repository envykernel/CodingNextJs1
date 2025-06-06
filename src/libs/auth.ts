// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'

import { prisma } from '@/prisma/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      organisationId?: string
      organisationName?: string | null
      role?: string | null
    }
  }
}

function safeString(val: unknown): string | undefined {
  return typeof val === 'string' ? val : undefined
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        try {
          const res = await fetch(`${process.env.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json()

          if (res.status === 401) throw new Error(JSON.stringify(data))
          if (res.status === 200) return data

          return null
        } catch (e: any) {
          throw new Error(e.message)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),

    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      allowDangerousEmailAccountLinking: true
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/fr/login',
    error: '/en/pages/misc/access-denied'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const internalUser = await prisma.userInternal.findUnique({
          where: { email: safeString(user.email) },
          include: { organisation: true }
        })

        token.name = internalUser?.name || safeString(user.name)
        token.email = safeString(user.email)
        token.organisationId = internalUser?.organisationId != null ? String(internalUser.organisationId) : undefined
        token.organisationName = internalUser?.organisation?.name
          ? safeString(internalUser.organisation.name)
          : undefined
        token.role = internalUser?.role
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = safeString(token.name)
        session.user.email = safeString(token.email)
        ;(session.user as any).organisationId = token.organisationId != null ? String(token.organisationId) : undefined
        ;(session.user as any).organisationName = token.organisationName
          ? safeString(token.organisationName)
          : undefined
        ;(session.user as any).role = token.role
      }

      return session
    },

    async signIn({ user, account }) {
      const internalUser = await prisma.userInternal.findUnique({
        where: { email: safeString(user.email) },
        include: { organisation: true }
      })

      if (!internalUser || !internalUser.isApproved || !internalUser.organisationId) {
        return '/fr/login?error=AccessDenied'
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { accounts: true }
      })

      if (existingUser) {
        const existingAccount = existingUser.accounts.find(
          acc => acc.provider === account?.provider && acc.providerAccountId === account?.providerAccountId
        )

        if (existingAccount) return true

        if (account) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: internalUser.name || user.name,
              image: user.image
            }
          })

          await prisma.account.create({
            data: {
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              expires_at: account.expires_at,
              id_token: account.id_token,
              refresh_token: account.refresh_token,
              session_state: account.session_state,
              token_type: account.token_type,
              scope: account.scope,
              organisationId: internalUser.organisationId
            }
          })

          return true
        }
      }

      if (account) {
        await prisma.user.create({
          data: {
            name: internalUser.name || user.name,
            email: user.email,
            image: user.image,
            organisationId: internalUser.organisationId,
            accounts: {
              create: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
                session_state: account.session_state,
                token_type: account.token_type,
                scope: account.scope,
                organisationId: internalUser.organisationId
              }
            }
          }
        })
      }

      return true
    }
  }
}
