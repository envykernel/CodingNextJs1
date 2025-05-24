import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button, CircularProgress } from '@mui/material'
import type { patient_visit } from '@prisma/client'

interface VisitActionButtonProps {
  appointmentId: number
  visit?: patient_visit
  t: any
  lang: string
  onVisitCreated?: () => void
  size?: 'small' | 'medium' | 'large'
  variant?: 'text' | 'outlined' | 'contained'
  className?: string
}

const VisitActionButton: React.FC<VisitActionButtonProps> = ({
  appointmentId,
  visit,
  t,
  lang,
  onVisitCreated,
  size = 'small',
  variant = 'outlined',
  className = ''
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (visit) {
    return (
      <Button
        variant={variant}
        color='success'
        size={size}
        className={`ml-2 ${className}`}
        onClick={() => router.push(`/${lang}/apps/visits/view/${visit.id}`)}
        startIcon={<i className='tabler-clipboard-check text-lg' />}
      >
        {t('appointments.actions.goToVisit')}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      color='primary'
      size={size}
      className={`ml-2 ${className}`}
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
      startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='tabler-plus text-lg' />}
    >
      {loading ? t('appointments.actions.loading') : t('appointments.actions.createVisit')}
    </Button>
  )
}

export default VisitActionButton
