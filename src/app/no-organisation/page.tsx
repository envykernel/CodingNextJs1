'use client'

// Add dynamic route configuration
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useSession, signOut } from 'next-auth/react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function NoOrganisationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/fr/login')
    } else if (status === 'authenticated' && session?.user?.organisationId) {
      router.push('/')
    }
  }, [status, session, router])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/fr/login')
  }

  // Don't render anything during SSR or initial client-side render
  if (!isClient || status === 'loading') {
    return null
  }

  // Don't render if not authenticated or has organisation
  if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.organisationId)) {
    return null
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <Typography variant='h4' className='mb-4 font-bold text-center text-gray-800 dark:text-gray-200'>
        Accès non autorisé
      </Typography>
      <Typography variant='body1' className='mb-6 text-center max-w-md text-gray-600 dark:text-gray-400'>
        Vous n&apos;appartenez à aucune organisation. Vous n&apos;avez pas les droits nécessaires pour accéder à cette
        application. Veuillez contacter votre administrateur pour obtenir les autorisations appropriées.
      </Typography>
      <Button variant='contained' color='error' onClick={handleSignOut} className='mt-4'>
        Se déconnecter
      </Button>
    </div>
  )
}
