import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@mui/material'
import type { patient_visit } from '@prisma/client'

interface VisitActionButtonProps {
  appointmentId: number
  visit?: patient_visit
  t: any
  lang: string
  onVisitCreated?: () => void
}

const VisitActionButton: React.FC<VisitActionButtonProps> = ({ appointmentId, visit, t, lang, onVisitCreated }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (visit) {
    return (
      <Button
        variant='outlined'
        color='success'
        size='small'
        className='ml-2'
        onClick={() => router.push(`/${lang}/apps/visits/view/${visit.id}`)}
        startIcon={<i className='tabler-clipboard-check text-lg' />}
      >
        {t.goToVisit || 'Go to Visit'}
      </Button>
    )
  }

  return (
    <Button
      variant='outlined'
      color='primary'
      size='small'
      className='ml-2'
      onClick={async () => {
        setLoading(true)

        try {
          const res = await fetch('/api/visits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointment_id: appointmentId })
          })

          const data = await res.json()

          if (res.ok) {
            if (data.visit && data.visit.id) {
              router.push(`/${lang}/apps/visits/view/${data.visit.id}`)
            }

            if (onVisitCreated) onVisitCreated()
          } else {
            console.error(data.error || 'Error creating visit')
          }
        } catch (e) {
          console.error('Error creating visit')
        } finally {
          setLoading(false)
        }
      }}
      disabled={loading}
      startIcon={<i className='tabler-plus text-lg' />}
    >
      {loading ? t.loading || 'Loading...' : t.createVisit || 'Create Visit'}
    </Button>
  )
}

export default VisitActionButton
