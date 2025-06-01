// Third-party Imports
import NextAuth from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

/*
 * As we do not have backend server, the refresh token feature has not been incorporated into the template.
 * Please refer https://next-auth.js.org/tutorials/refresh-token-rotation link for a reference.
 */

// Ensure we're using the latest version of NextAuth
const handler = NextAuth({
  ...authOptions,
  debug: process.env.NODE_ENV === 'development'
})

export { handler as GET, handler as POST }
