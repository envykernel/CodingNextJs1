// Remove the 'use client' directive
// 'use client'

// React Imports
// import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// import { useTheme } from '@mui/material/styles'
// import { useSession } from 'next-auth/react'

// Component Imports
// import StatisticsCard from '@views/pages/widget-examples/statistics/StatisticsCard'
// import CardStatsWithAreaChart from '@components/card-statistics/CardStatsWithAreaChart'

import { getServerSession } from 'next-auth'

import FinanceCharts from './components/FinanceCharts'
import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'
import PaymentTrends from './components/PaymentTrends'
import FinanceStatistics from './components/FinanceStatistics'

const FinanceDashboard = async () => {
  const session = await getServerSession(authOptions)
  const userOrgId = Number(session?.user?.organisationId)

  // Get payments data for the organization
  const payments = await prisma.payment.findMany({
    where: {
      organisation_id: userOrgId
    },
    orderBy: {
      payment_date: 'desc'
    }
  })

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

  return (
    <Grid container spacing={6}>
      {/* Statistics */}
      <FinanceStatistics />

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
