'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/contexts/translationContext'
import { Card, CardHeader, CardContent, Box, Typography, Alert, CircularProgress, useTheme } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface VisitHourData {
  hour: string
  count: number
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const { t } = useTranslation()
  const theme = useTheme()

  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1.5,
          boxShadow: theme.shadows[3]
        }}
      >
        <Typography variant='body2' sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
          {`${t('organization.hour')}: ${label}`}
        </Typography>
        <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
          {`${t('organization.visits')}: ${payload[0].value}`}
        </Typography>
      </Box>
    )
  }

  return null
}

const VisitHoursDistribution = () => {
  const { t } = useTranslation()
  const theme = useTheme()
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
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            textAlign: 'center'
          }}
        >
          <Typography variant='body1' color='text.secondary'>
            {t('common.tryAgainLater')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (!visitData.length) {
    return (
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            textAlign: 'center'
          }}
        >
          <Typography variant='body1' color='text.secondary'>
            {t('organization.noVisitData')}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={t('common.organization.visitHoursDistribution')}
        titleTypographyProps={{ variant: 'h6' }}
        subheader={t('common.organization.dataPeriod')}
      />
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
              <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
              <XAxis
                dataKey='hour'
                label={{
                  value: t('organization.hourOfDay'),
                  position: 'insideBottom',
                  offset: -5,
                  fill: theme.palette.text.primary
                }}
                stroke={theme.palette.text.secondary}
              />
              <YAxis
                label={{
                  value: t('organization.numberOfVisits'),
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.primary
                }}
                stroke={theme.palette.text.secondary}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='count'
                fill={theme.palette.primary.main}
                name={t('organization.visits')}
                radius={[4, 4, 0, 0]} // Rounded corners on top
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default VisitHoursDistribution
