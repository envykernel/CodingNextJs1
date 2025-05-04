import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

/**
 * Returns the organisationId (as a number) and organisationName of the logged-in user.
 * Throws an error if not found.
 */
export async function getUserOrganisation() {
  const session = await getServerSession(authOptions)
  const organisationId = session?.user?.organisationId ? Number(session.user.organisationId) : undefined
  const organisationName = session?.user?.organisationName

  if (!organisationId) throw new Error('No organisationId found in session')

  return { organisationId, organisationName }
}
