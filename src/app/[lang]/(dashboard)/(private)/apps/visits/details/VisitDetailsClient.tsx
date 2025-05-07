// VisitDetails page
'use client'

import { useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { Card, CardContent, Typography, Divider, CircularProgress } from '@mui/material'

import { useTranslation } from '@/contexts/translationContext'

const VisitDetailsClient = () => {
  const searchParams = useSearchParams()
  const visitId = searchParams ? searchParams.get('id') : null
  const t = useTranslation()
  const [visit, setVisit] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!visitId) return
    setLoading(true)
    fetch(`/api/visits?id=${visitId}`)
      .then(res => res.json())
      .then(data => {
        if (data.visit) setVisit(data.visit)
        else setError(data.error || 'Not found')
      })
      .catch(() => setError('Error fetching visit'))
      .finally(() => setLoading(false))
  }, [visitId])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'

    return new Date(dateString).toISOString().slice(0, 10)
  }

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-'

    return new Date(dateString).toISOString().slice(11, 19)
  }

  if (loading)
    return (
      <div className='flex justify-center p-8'>
        <CircularProgress />
      </div>
    )
  if (error) return <div className='text-red-600 p-8'>{error}</div>
  if (!visit) return null

  // Debug log to inspect patient and doctor objects
  console.log('visit.patient', visit.patient)
  console.log('visit.doctor', visit.doctor)

  return (
    <Card className='max-w-2xl mx-auto mt-8'>
      <CardContent>
        <Typography variant='h4' mb={2}>
          {t.visitDetails || 'Visit Details'}
        </Typography>
        <Divider className='mb-4' />
        <div className='space-y-2'>
          <Typography>
            <b>{t.patient?.label || 'Patient'}:</b> {visit.patient?.name || '-'}
          </Typography>
          <Typography>
            <b>{t.patient?.birthdate || 'Birthdate'}:</b>{' '}
            {visit.patient?.birthdate ? formatDate(visit.patient.birthdate) : '-'}
          </Typography>
          <Typography>
            <b>{t.patient?.gender || 'Gender'}:</b> {visit.patient?.gender || '-'}
          </Typography>
          <Typography>
            <b>{t.patient?.phone || 'Phone'}:</b> {visit.patient?.phone || '-'}
          </Typography>
          <Typography>
            <b>{t.patient?.email || 'Email'}:</b> {visit.patient?.email || '-'}
          </Typography>
          <Typography>
            <b>{t.patient?.address || 'Address'}:</b> {visit.patient?.address || '-'}
          </Typography>
          <Typography>
            <b>{t.patient?.city || 'City'}:</b> {visit.patient?.city || '-'}
          </Typography>
          <Divider className='my-2' />
          <Typography>
            <b>{t.doctor?.label || 'Doctor'}:</b> {visit.doctor?.name || '-'}
          </Typography>
          <Typography>
            <b>{t.doctor?.email || 'Email'}:</b> {visit.doctor?.email || '-'}
          </Typography>
          <Typography>
            <b>{t.doctor?.phone || 'Phone'}:</b> {visit.doctor?.phone || '-'}
          </Typography>
          <Divider className='my-2' />
          <Typography>
            <b>{t.date || 'Date'}:</b> {formatDate(visit.arrival_time)}
          </Typography>
          <Typography>
            <b>{t.startTime || 'Start Time'}:</b> {formatTime(visit.start_time)}
          </Typography>
          <Typography>
            <b>{t.endTime || 'End Time'}:</b> {formatTime(visit.end_time)}
          </Typography>
          <Typography>
            <b>{t.status || 'Status'}:</b> {visit.status || '-'}
          </Typography>
          <Typography>
            <b>{t.notes || 'Notes'}:</b> {visit.notes || '-'}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default VisitDetailsClient
