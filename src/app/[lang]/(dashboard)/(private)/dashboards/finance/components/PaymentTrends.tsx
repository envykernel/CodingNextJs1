'use client'

// React Imports
import { useEffect, useState, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid2'
import Paper from '@mui/material/Paper'
import LinearProgress from '@mui/material/LinearProgress'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

// Third-party Imports
import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import { getPaymentTrendsData } from '@/app/server/financeActions'

// Type Imports
import type { PeriodType, ComparisonType } from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/types'

const PERIOD_OPTIONS: PeriodType[] = ['This Week', 'This Month', 'This Year']

type PaymentBreakdown = {
  period: string
  totalPaid: number
  date: Date
}

type PaymentTrendsData = {
  breakdown: PaymentBreakdown[]
  totalPaid: number
  growth: number
  period: PeriodType
  comparisonType: ComparisonType
}

const PaymentTrends = () => {
  // ** States
  const [data, setData] = useState<PaymentTrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<PeriodType>('This Month')

  // ** Hooks
  const { data: session } = useSession()
  const { t } = useTranslation()

  // Helper function to translate period labels
  const getTranslatedPeriodLabel = (periodLabel: string, filterType: string): string => {
    // For daily view (This Week)
    if (filterType === 'daily') {
      // Map of English day abbreviations to their full names
      const dayMap: { [key: string]: string } = {
        Sun: 'sunday',
        Mon: 'monday',
        Tue: 'tuesday',
        Wed: 'wednesday',
        Thu: 'thursday',
        Fri: 'friday',
        Sat: 'saturday'
      }

      // Get the full day name from the abbreviation
      const fullDay = dayMap[periodLabel]

      if (!fullDay) return periodLabel

      // Get the translation for the day
      const translatedDay = t(`financeDashboard.paymentTrends.days.${fullDay}`)

      // If translation exists and is different from the key, use it
      if (translatedDay && translatedDay !== `financeDashboard.paymentTrends.days.${fullDay}`) {
        return translatedDay
      }

      return periodLabel
    }

    // For weekly view (This Month)
    if (filterType === 'weekly') {
      // Check if it's a week label (e.g., "Week 1")
      const weekMatch = periodLabel.match(/Week (\d+)/i)

      if (weekMatch) {
        return t(`financeDashboard.paymentTrends.weeks.week${weekMatch[1]}`)
      }

      return periodLabel
    }

    // For monthly view (This Year)
    if (filterType === 'monthly') {
      // Check if it's a date with month (e.g., "15 Jan")
      const dateMatch = periodLabel.match(/(\d+)\s+(\w+)/)

      if (dateMatch) {
        const [, day, monthAbbr] = dateMatch

        // Map of English month abbreviations to their full names
        const monthMap: { [key: string]: string } = {
          Jan: 'january',
          Feb: 'february',
          Mar: 'march',
          Apr: 'april',
          May: 'may',
          Jun: 'june',
          Jul: 'july',
          Aug: 'august',
          Sep: 'september',
          Oct: 'october',
          Nov: 'november',
          Dec: 'december'
        }

        const fullMonth = monthMap[monthAbbr]

        if (!fullMonth) return periodLabel

        // Get the translation for the month
        const translatedMonth = t(`financeDashboard.paymentTrends.months.${fullMonth}`)

        // If translation exists and is different from the key, use it
        if (translatedMonth && translatedMonth !== `financeDashboard.paymentTrends.months.${fullMonth}`) {
          return `${day} ${translatedMonth}`
        }

        return periodLabel
      }

      // Handle single month abbreviation (e.g., "Jan")
      const monthMap: { [key: string]: string } = {
        Jan: 'january',
        Feb: 'february',
        Mar: 'march',
        Apr: 'april',
        May: 'may',
        Jun: 'june',
        Jul: 'july',
        Aug: 'august',
        Sep: 'september',
        Oct: 'october',
        Nov: 'november',
        Dec: 'december'
      }

      const fullMonth = monthMap[periodLabel]

      if (!fullMonth) return periodLabel

      // Get the translation for the month
      const translatedMonth = t(`financeDashboard.paymentTrends.months.${fullMonth}`)

      // If translation exists and is different from the key, use it
      if (translatedMonth && translatedMonth !== `financeDashboard.paymentTrends.months.${fullMonth}`) {
        return translatedMonth
      }

      return periodLabel
    }

    return periodLabel
  }

  // ** Handlers
  const handlePeriodSelect = (newPeriod: PeriodType) => {
    setPeriod(newPeriod)
  }

  // Format currency helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    })
  }

  // Get filter type based on period
  const getFilterType = useCallback((period: PeriodType) => {
    switch (period) {
      case 'This Week':
        return 'daily'
      case 'This Month':
        return 'weekly'
      case 'This Year':
        return 'monthly'
      default:
        return 'monthly'
    }
  }, [])

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!session?.user?.organisationId) return

    try {
      setLoading(true)
      setError(null)
      const filter = getFilterType(period)

      const result = await getPaymentTrendsData(
        Number(session.user.organisationId),
        period as any, // Type assertion needed due to backend type mismatch
        filter
      )

      setData(result as PaymentTrendsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.organisationId, period, getFilterType])

  // ** Effects
  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <Card>
        <CardHeader
          title={t('financeDashboard.paymentTrends.title')}
          action={
            <ButtonGroup variant='outlined' size='small'>
              {PERIOD_OPTIONS.map(option => (
                <Button
                  key={option}
                  onClick={() => handlePeriodSelect(option)}
                  variant={period === option ? 'contained' : 'outlined'}
                >
                  {t(`common.periods.${option.toLowerCase()}`)}
                </Button>
              ))}
            </ButtonGroup>
          }
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{t('financeDashboard.paymentTrends.loading')}</Typography>
        </Box>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader
          title={t('financeDashboard.paymentTrends.title')}
          action={
            <ButtonGroup variant='outlined' size='small'>
              {PERIOD_OPTIONS.map(option => (
                <Button
                  key={option}
                  onClick={() => handlePeriodSelect(option)}
                  variant={period === option ? 'contained' : 'outlined'}
                >
                  {t(`common.periods.${option.toLowerCase()}`)}
                </Button>
              ))}
            </ButtonGroup>
          }
        />
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography color='error'>{t('financeDashboard.paymentTrends.error')}</Typography>
        </Box>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader
          title={t('financeDashboard.paymentTrends.title')}
          action={
            <ButtonGroup variant='outlined' size='small'>
              {PERIOD_OPTIONS.map(option => (
                <Button
                  key={option}
                  onClick={() => handlePeriodSelect(option)}
                  variant={period === option ? 'contained' : 'outlined'}
                >
                  {t(`common.periods.${option.toLowerCase()}`)}
                </Button>
              ))}
            </ButtonGroup>
          }
        />
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <Typography>{t('financeDashboard.paymentTrends.noData')}</Typography>
        </Box>
      </Card>
    )
  }

  // Calculate max value for progress bars, excluding zero values
  const nonZeroValues = data?.breakdown.filter(item => item.totalPaid > 0).map(item => item.totalPaid) || []
  const maxValue = nonZeroValues.length > 0 ? Math.max(...nonZeroValues) : 0

  return (
    <Card>
      <CardHeader
        title={t('financeDashboard.paymentTrends.title')}
        action={
          <ButtonGroup variant='outlined' size='small'>
            {PERIOD_OPTIONS.map(option => (
              <Button
                key={option}
                onClick={() => handlePeriodSelect(option)}
                variant={period === option ? 'contained' : 'outlined'}
              >
                {t(`common.periods.${option.toLowerCase()}`)}
              </Button>
            ))}
          </ButtonGroup>
        }
      />
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant='h4' sx={{ mr: 2 }}>
            {formatCurrency(data.totalPaid)}
          </Typography>
          {data.growth > 0 ? (
            <Typography color='success.main'>{t('financeDashboard.paymentTrends.growth.positive')}</Typography>
          ) : data.growth < 0 ? (
            <Typography color='error.main'>{t('financeDashboard.paymentTrends.growth.negative')}</Typography>
          ) : (
            <Typography color='text.secondary'>{t('financeDashboard.paymentTrends.growth.neutral')}</Typography>
          )}
        </Box>

        <Grid container spacing={4}>
          {data.breakdown.map((item, index) => {
            const isBestPeriod = item.totalPaid === maxValue && item.totalPaid > 0
            const filterType = getFilterType(period)
            const translatedPeriod = getTranslatedPeriodLabel(item.period, filterType)

            return (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: isBestPeriod ? 'success.main' : 'divider',
                    borderRadius: 1,
                    backgroundColor: item.totalPaid === 0 ? 'action.hover' : 'background.paper',
                    position: 'relative',
                    '&::before': isBestPeriod
                      ? {
                          content: `"${t('financeDashboard.paymentTrends.bestPeriod')}"`,
                          position: 'absolute',
                          top: -10,
                          right: 10,
                          backgroundColor: 'success.main',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }
                      : {}
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      {translatedPeriod}
                    </Typography>
                    <Typography
                      variant='h6'
                      color={item.totalPaid === 0 ? 'text.disabled' : isBestPeriod ? 'success.main' : 'text.primary'}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {formatCurrency(item.totalPaid)}
                      {isBestPeriod && <i className='tabler:crown text-success' style={{ fontSize: '1.2rem' }} />}
                    </Typography>
                  </Box>
                  {item.totalPaid === 0 ? (
                    <Box
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'divider',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)'
                        }
                      }}
                    />
                  ) : (
                    <LinearProgress
                      variant='determinate'
                      value={(item.totalPaid / maxValue) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'primary.light',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: isBestPeriod ? 'success.main' : 'primary.main'
                        }
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Card>
  )
}

export default PaymentTrends
