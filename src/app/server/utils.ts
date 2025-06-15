import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

export async function requireAuthAndOrg() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  if (!session?.user?.organisationId) {
    throw new Error('User not authenticated or no organization assigned')
  }

  return {
    organisationId: parseInt(session.user.organisationId)
  }
}
