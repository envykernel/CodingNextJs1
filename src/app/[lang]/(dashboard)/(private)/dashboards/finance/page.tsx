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
import { authOptions } from '@/libs/auth'
import PaymentTrends from './components/PaymentTrends'
import FinanceStatistics from './components/FinanceStatistics'
import { getPaymentMethodsData } from '@/app/server/financeActions'

const FinanceDashboard = async () => {
  const session = await getServerSession(authOptions)
  const userOrgId = Number(session?.user?.organisationId)

  // Get payment methods data for the organization
  const paymentMethodsData = await getPaymentMethodsData(userOrgId)

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
