// Remove the 'use client' directive
// 'use client'

// React Imports
// import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// import { useTheme } from '@mui/material/styles'
// import { useSession } from 'next-auth/react'

// Component Imports
// import StatisticsCard from '@views/pages/widget-examples/statistics/StatisticsCard'
// import CardStatsWithAreaChart from '@components/card-statistics/CardStatsWithAreaChart'

import { getServerSession } from 'next-auth'

import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder'
import FinanceCharts from './components/FinanceCharts'
import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'
import type { ThemeColor } from '@core/types'
import PaymentTrends from './components/PaymentTrends'

const FinanceDashboard = async () => {
  const session = await getServerSession(authOptions)
  const userOrgId = Number(session?.user?.organisationId)

  // Get financial data for the organization
  const [invoices, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        organisation_id: userOrgId,
        record_status: 'ACTIVE'
      },
      include: {
        lines: true,
        payment_apps: true
      },
      orderBy: {
        invoice_date: 'desc'
      }
    }),
    prisma.payment.findMany({
      where: {
        organisation_id: userOrgId
      },
      orderBy: {
        payment_date: 'desc'
      }
    })
  ])

  // Calculate key metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0)
  const totalPaid = payments.reduce((sum, pay) => sum + Number(pay.amount), 0)
  const totalPending = totalInvoiced - totalPaid
  const totalInvoices = invoices.length
  const totalPayments = payments.length

  // Group payments by payment method
  const paymentMethodsMap = payments.reduce(
    (acc, payment) => {
      const method = payment.payment_method
      const amount = Number(payment.amount)

      acc[method] = (acc[method] || 0) + amount

      return acc
    },
    {} as Record<string, number>
  )

  // Prepare data for payment methods chart
  const paymentMethodsData = {
    series: Object.values(paymentMethodsMap),
    labels: Object.keys(paymentMethodsMap).map(method => method.replace('_', ' '))
  }

  // Prepare statistics cards data
  const statsData = [
    {
      stats: totalInvoiced.toLocaleString('en-US', { style: 'currency', currency: 'EUR' }),
      title: 'Total Invoiced',
      color: 'primary' as ThemeColor,
      icon: 'tabler-file-invoice'
    },
    {
      stats: totalPaid.toLocaleString('en-US', { style: 'currency', currency: 'EUR' }),
      title: 'Total Paid',
      color: 'success' as ThemeColor,
      icon: 'tabler-cash'
    },
    {
      stats: totalPending.toLocaleString('en-US', { style: 'currency', currency: 'EUR' }),
      title: 'Total Pending',
      color: 'warning' as ThemeColor,
      icon: 'tabler-clock'
    },
    {
      stats: totalInvoices.toString(),
      title: 'Total Invoices',
      color: 'info' as ThemeColor,
      icon: 'tabler-file-text'
    }
  ]

  // Prepare horizontal stats data
  const horizontalStatsData = [
    {
      stats: totalPayments,
      title: 'Total Payments',
      avatarIcon: 'tabler-credit-card',
      color: 'success' as ThemeColor,
      trendNumber: 12
    },
    {
      stats: Math.round((totalPaid / totalInvoiced) * 100),
      title: 'Collection Rate',
      avatarIcon: 'tabler-chart-bar',
      color: 'primary' as ThemeColor,
      trendNumber: 5
    },
    {
      stats: Math.round((invoices.filter(inv => inv.payment_status === 'PAID').length / totalInvoices) * 100),
      title: 'Paid Invoices',
      avatarIcon: 'tabler-check',
      color: 'success' as ThemeColor,
      trendNumber: 8
    },
    {
      stats: Math.round((invoices.filter(inv => inv.payment_status === 'PENDING').length / totalInvoices) * 100),
      title: 'Pending Invoices',
      avatarIcon: 'tabler-clock',
      color: 'warning' as ThemeColor,
      trendNumber: -3
    }
  ]

  return (
    <Grid container spacing={6}>
      {/* Statistics Cards */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Statistics' />
          <CardContent>
            <Grid container spacing={4}>
              {statsData.map((item, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <div className='flex items-center gap-4'>
                    <div className='flex flex-col'>
                      <Typography variant='h5'>{item.stats}</Typography>
                      <Typography variant='body2'>{item.title}</Typography>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Horizontal Stats */}
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={6}>
          {horizontalStatsData.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <HorizontalWithBorder {...item} />
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Charts */}
      <FinanceCharts paymentMethodsData={paymentMethodsData} />

      {/* Payment Trends */}
      <Grid size={{ xs: 12 }}>
        <PaymentTrends />
      </Grid>
    </Grid>
  )
}

export default FinanceDashboard
