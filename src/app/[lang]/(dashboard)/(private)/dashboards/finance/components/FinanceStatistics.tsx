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
import CreditCardIcon from '@mui/icons-material/CreditCard'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'

import type { ThemeColor } from '@core/types'
import FinanceHorizontalWithCircleIcon from './FinanceHorizontalWithCircleIcon'
import { getFinanceStatistics } from '../actions'

type StatisticsData = {
  totalInvoiced: number
  totalPaid: number
  totalPending: number
  totalInvoices: number
  totalPayments: number
  paidInvoicesPercentage: number
  pendingInvoicesPercentage: number
  collectionRate: number
}

const FinanceStatistics = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StatisticsData | null>(null)

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
        <CardHeader title='Statistics' />
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
        <CardHeader title='Statistics' />
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
            <Typography color='error'>{error}</Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader title='Statistics' />
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={200}>
            <Typography color='text.secondary'>No statistics data available</Typography>
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
      title: 'Total Invoiced',
      icon: <AccountBalanceWalletIcon />,
      color: 'primary',
      trendNumber: 0,
      trendPeriod: 'This Year'
    },
    {
      stats: formatCurrency(data.totalPaid),
      title: 'Total Paid',
      icon: <AttachMoneyIcon />,
      color: 'success',
      trendNumber: 0,
      trendPeriod: 'This Year'
    },
    {
      stats: formatCurrency(data.totalPending),
      title: 'Total Pending',
      icon: <HourglassEmptyIcon />,
      color: 'warning',
      trendNumber: 0,
      trendPeriod: 'This Year'
    },
    {
      stats: data.totalInvoices,
      title: 'Total Invoices',
      icon: <ArticleIcon />,
      color: 'info',
      trendNumber: 0,
      trendPeriod: 'This Year'
    }
  ]

  // Horizontal stats data
  const horizontalStatsData: {
    stats: number
    title: string
    icon: JSX.Element
    color: ThemeColor
    trendNumber: number
    trendPeriod: 'This Week' | 'This Month' | 'This Year'
  }[] = [
    {
      stats: data.totalPayments,
      title: 'Total Payments',
      icon: <CreditCardIcon />,
      color: 'success',
      trendNumber: 12,
      trendPeriod: 'This Month'
    },
    {
      stats: data.collectionRate,
      title: 'Collection Rate',
      icon: <TrendingUpIcon />,
      color: 'primary',
      trendNumber: 5,
      trendPeriod: 'This Month'
    },
    {
      stats: data.paidInvoicesPercentage,
      title: 'Paid Invoices',
      icon: <CheckCircleIcon />,
      color: 'success',
      trendNumber: 8,
      trendPeriod: 'This Month'
    },
    {
      stats: data.pendingInvoicesPercentage,
      title: 'Pending Invoices',
      icon: <ScheduleIcon />,
      color: 'warning',
      trendNumber: -3,
      trendPeriod: 'This Month'
    }
  ]

  return (
    <>
      {/* Statistics Cards */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={6}>
          {statsData.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <FinanceHorizontalWithCircleIcon {...item} />
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Horizontal Stats */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={6}>
          {horizontalStatsData.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <FinanceHorizontalWithCircleIcon {...item} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  )
}

export default FinanceStatistics
