'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/contexts/translationContext'
import { Card, CardHeader, CardContent, Box, Typography, Alert, CircularProgress } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface VisitHourData {
  hour: string
  count: number
}

const VisitHoursDistribution = () => {
  const { t } = useTranslation()
  const { data: session, status: sessionStatus } = useSession()
  const [visitData, setVisitData] = useState<VisitHourData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVisitData = async () => {
      if (sessionStatus === 'loading') return

      if (!session?.user?.organisationId) {
        setError(t('common.notAuthorized') || 'Not authorized')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/visits/hours-distribution', {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server')
        }

        setVisitData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching visit data')
      } finally {
        setLoading(false)
      }
    }

    fetchVisitData()
  }, [session, sessionStatus, t])

  if (sessionStatus === 'loading' || loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant='body2' color='text.secondary'>
            {t('common.tryAgainLater') || 'Please try again later or contact support if the problem persists.'}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (!visitData.length) {
    return (
      <Card>
        <CardContent>
          <Alert severity='info'>
            {t('organization.noVisitData') || 'No visit data available for the selected period.'}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={t('organization.visitHoursDistribution')} titleTypographyProps={{ variant: 'h6' }} />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={visitData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='hour'
                label={{
                  value: t('organization.hourOfDay'),
                  position: 'insideBottom',
                  offset: -5
                }}
              />
              <YAxis
                label={{
                  value: t('organization.numberOfVisits'),
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip
                formatter={(value: number) => [value, t('organization.visits')]}
                labelFormatter={label => `${t('organization.hour')}: ${label}`}
              />
              <Bar dataKey='count' fill='#2196f3' name={t('organization.visits')} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default VisitHoursDistribution
