'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

// Component Imports
import CardStatisticsHorizontal from '@components/card-statistics/HorizontalWithSubtitle'

// Context Imports
import { useTranslation } from '@/contexts/translationContext'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

const RevenueOverview = () => {
  const { t } = useTranslation()
  const [statistics, setStatistics] = useState<UserDataType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setError(null)
        // TODO: Replace with actual API call
        const mockData = {
          monthlyRevenue: {
            amount: 25000,
            trend: 'up',
            percentageChange: 12.5
          },
          yearlyRevenue: {
            amount: 285000,
            trend: 'up',
            percentageChange: 8.3
          },
          outstandingInvoices: {
            amount: 15000,
            trend: 'down',
            percentageChange: 5.2
          },
          averagePaymentTime: {
            days: 15,
            trend: 'down',
            percentageChange: 3.1
          }
        }

        setStatistics([
          {
            title: t('finance.statistics.monthlyRevenue'),
            stats: `$${mockData.monthlyRevenue.amount.toLocaleString()}`,
            avatarIcon: 'tabler-currency-dollar',
            avatarColor: 'success',
            trend: mockData.monthlyRevenue.trend,
            trendNumber: `${Math.abs(Math.round(mockData.monthlyRevenue.percentageChange))}%`,
            subtitle: t('finance.statistics.monthlyComparison')
          },
          {
            title: t('finance.statistics.yearlyRevenue'),
            stats: `$${mockData.yearlyRevenue.amount.toLocaleString()}`,
            avatarIcon: 'tabler-currency-dollar',
            avatarColor: 'success',
            trend: mockData.yearlyRevenue.trend,
            trendNumber: `${Math.abs(Math.round(mockData.yearlyRevenue.percentageChange))}%`,
            subtitle: t('finance.statistics.yearlyComparison')
          },
          {
            title: t('finance.statistics.outstandingInvoices'),
            stats: `$${mockData.outstandingInvoices.amount.toLocaleString()}`,
            avatarIcon: 'tabler-receipt',
            avatarColor: 'warning',
            trend: mockData.outstandingInvoices.trend,
            trendNumber: `${Math.abs(Math.round(mockData.outstandingInvoices.percentageChange))}%`,
            subtitle: t('finance.statistics.monthlyComparison')
          },
          {
            title: t('finance.statistics.averagePaymentTime'),
            stats: `${mockData.averagePaymentTime.days} days`,
            avatarIcon: 'tabler-clock',
            avatarColor: 'info',
            trend: mockData.averagePaymentTime.trend,
            trendNumber: `${Math.abs(Math.round(mockData.averagePaymentTime.percentageChange))}%`,
            subtitle: t('finance.statistics.monthlyComparison')
          }
        ])
      } catch (error) {
        console.error('Error fetching revenue statistics:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch statistics')
        setStatistics([])
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [t])

  if (loading) {
    return null // Loading state is handled by the parent component
  }

  if (error) {
    return null // Error state is handled by the parent component
  }

  return (
    <Card>
      <CardHeader title={t('finance.overview.title')} />
      <Grid container spacing={6} sx={{ p: 6 }}>
        {statistics.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <CardStatisticsHorizontal {...item} />
          </Grid>
        ))}
      </Grid>
    </Card>
  )
}

export default RevenueOverview
