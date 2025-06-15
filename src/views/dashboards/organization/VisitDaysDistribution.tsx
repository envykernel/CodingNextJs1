'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/contexts/translationContext'
import { Card, CardHeader, CardContent, Box, Typography, CircularProgress, useTheme } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

// Import the server action using dynamic import to ensure it's not included in the client bundle
const getVisitDaysDistribution = async () => {
  const { getVisitDaysDistribution } = await import('@/app/server/visitActions')
  return getVisitDaysDistribution()
}

interface VisitDayData {
  day: string
  count: number
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const { t } = useTranslation()

  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Typography variant='body2'>{`${t('common.organization.day')}: ${t(`common.days.${label}`)}`}</Typography>
        <Typography variant='body2'>{`${t('common.organization.visits')}: ${payload[0].value}`}</Typography>
      </Box>
    )
  }
  return null
}

export default function VisitDaysDistribution() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [visitData, setVisitData] = useState<VisitDayData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVisitDaysDistribution()
        setVisitData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
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
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography color='error'>{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!visitData.length) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography>{t('common.organization.noVisitData')}</Typography>
        </CardContent>
      </Card>
    )
  }

  // Transform data to use translated day names
  const translatedData = visitData.map(item => ({
    ...item,
    day: t(`common.days.${item.day}`)
  }))

  return (
    <Card>
      <CardHeader
        title={t('common.organization.visitDaysDistribution')}
        subheader={t('common.organization.dataPeriod')}
      />
      <CardContent>
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={translatedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='day' tick={{ fill: theme.palette.text.primary }} />
              <YAxis
                tick={{ fill: theme.palette.text.primary }}
                label={{
                  value: t('common.organization.numberOfVisits'),
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: theme.palette.text.primary }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='count' fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
