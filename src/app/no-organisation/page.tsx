'use client'

// Add dynamic route configuration
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession, signOut } from 'next-auth/react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { useTranslation } from '@/contexts/translationContext'

export default function NoOrganisationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!session) {
      router.push('/api/auth/signin')
    }

    if (session?.user?.organisationId) {
      router.push('/')
    }
  }, [session, router])

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900'>
      <Typography variant='h4' className='mb-4 font-bold text-center'>
        {t('noOrganisationTitle')}
      </Typography>
      <Typography variant='body1' className='mb-6 text-center'>
        {t('noOrganisationPrompt')}
      </Typography>
      <div className='flex flex-col gap-2 w-full max-w-xs'>
        <Button variant='contained' color='primary' fullWidth onClick={() => router.push('/organisation/join')}>
          {t('joinOrganisation')}
        </Button>
        <Button variant='outlined' color='primary' fullWidth onClick={() => router.push('/organisation/create')}>
          {t('createOrganisation')}
        </Button>
        <Button variant='text' color='error' fullWidth onClick={() => signOut()}>
          {t('signOut')}
        </Button>
      </div>
    </div>
  )
}
