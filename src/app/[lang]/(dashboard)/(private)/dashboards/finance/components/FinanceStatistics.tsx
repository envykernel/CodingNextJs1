'use client'

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ArticleIcon from '@mui/icons-material/Article'

import { useTranslation } from '@/contexts/translationContext'

import type { ThemeColor } from '@core/types'
import FinanceHorizontalWithCircleIcon from './FinanceHorizontalWithCircleIcon'
import { getFinanceStatistics } from '@/app/server/financeActions'

type StatisticsData = {
  totalInvoiced: number
  totalPaid: number
  totalPending: number
  totalInvoices: number
  totalPayments: number
  paidInvoicesPercentage: number
  pendingInvoicesPercentage: number
  collectionRate: number
  invoicedGrowth: number
  paidGrowth: number
  pendingGrowth: number
  invoicesGrowth: number
  paymentsGrowth: number
  paidPercentageGrowth: number
  pendingPercentageGrowth: number
  collectionRateGrowth: number
}

const FinanceStatistics = () => {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StatisticsData | null>(null)

  // Define trend period constant
  const TREND_PERIOD: 'This Week' | 'This Month' | 'This Year' = 'This Year'

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.organisationId) return

      try {
        setLoading(true)
        setError(null)

        const statisticsData = await getFinanceStatistics(Number(session.user.organisationId))

        setData(statisticsData)
      } catch (error) {
        console.error('Error fetching finance statistics:', error)
        setError('Failed to load finance statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session?.user?.organisationId])

  if (loading) {
    return (
      <Card>
        <CardHeader title={t('financeDashboard.statistics.title')} />
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title={t('financeDashboard.statistics.title')} />
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
            <Typography color='error'>{t('financeDashboard.statistics.error')}</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader title={t('financeDashboard.statistics.title')} />
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
            <Typography color='text.secondary'>{t('financeDashboard.statistics.noData')}</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // Format currency helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'MAD',
      currencyDisplay: 'code'
    })
  }

  // Statistics cards data
  const statsData: {
    stats: string | number
    title: string
    icon: JSX.Element
    color: ThemeColor
    trendNumber: number
    trendPeriod: 'This Week' | 'This Month' | 'This Year'
  }[] = [
    {
      stats: formatCurrency(data.totalInvoiced),
      title: t('financeDashboard.statistics.totalInvoiced'),
      icon: <AccountBalanceWalletIcon />,
      color: 'primary',
      trendNumber: data.invoicedGrowth,
      trendPeriod: TREND_PERIOD
    },
    {
      stats: formatCurrency(data.totalPaid),
      title: t('financeDashboard.statistics.totalPaid'),
      icon: <AttachMoneyIcon />,
      color: 'success',
      trendNumber: data.paidGrowth,
      trendPeriod: TREND_PERIOD
    },
    {
      stats: formatCurrency(data.totalPending),
      title: t('financeDashboard.statistics.totalPending'),
      icon: <HourglassEmptyIcon />,
      color: 'warning',
      trendNumber: data.pendingGrowth,
      trendPeriod: TREND_PERIOD
    },
    {
      stats: data.totalInvoices,
      title: t('financeDashboard.statistics.totalInvoices'),
      icon: <ArticleIcon />,
      color: 'info',
      trendNumber: data.invoicesGrowth,
      trendPeriod: TREND_PERIOD
    }
  ]

  return (
    <Grid size={{ xs: 12 }}>
      <Grid container spacing={6}>
        {statsData.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <FinanceHorizontalWithCircleIcon {...item} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  )
}

export default FinanceStatistics
