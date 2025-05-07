import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@mui/material'
import type { patient_visit } from '@prisma/client'

interface VisitActionButtonProps {
  appointmentId: number
  visit?: patient_visit
  t: any
  onVisitCreated?: () => void
}

const VisitActionButton: React.FC<VisitActionButtonProps> = ({ appointmentId, visit, t, onVisitCreated }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (visit) {
    return (
      <Button
        variant='outlined'
        color='success'
        className='ml-2'
        onClick={() => router.push(`/fr/apps/visits/view/${visit.id}`)}
      >
        {t.goToVisit || 'Go to Visit'}
      </Button>
    )
  }

  return (
    <Button
      variant='outlined'
      color='secondary'
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
    >
      {loading ? t.loading || 'Loading...' : t.createVisit || 'Create Visit'}
    </Button>
  )
}

export default VisitActionButton
