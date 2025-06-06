'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

// Component Imports
import RevenueOverview from '@/views/dashboards/finance/RevenueOverview'

// Context Imports
import { useTranslation } from '@/contexts/translationContext'

const FinanceDashboard = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)

        // TODO: Add API calls for financial data
        setLoading(false)
      } catch (error) {
        console.error('Error fetching financial data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch financial data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert severity='info'>{t('common.loading')}</Alert>
        </Grid>
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert severity='error'>{error}</Alert>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Revenue Overview */}
      <Grid item xs={12}>
        <RevenueOverview />
      </Grid>

      {/* Monthly Revenue Chart */}
      <Grid item xs={12} md={8}>
        {/* TODO: Add MonthlyRevenueChart component */}
      </Grid>

      {/* Payment Methods Distribution */}
      <Grid item xs={12} md={4}>
        {/* TODO: Add PaymentMethodsDistribution component */}
      </Grid>

      {/* Outstanding Invoices */}
      <Grid item xs={12} md={6}>
        {/* TODO: Add OutstandingInvoices component */}
      </Grid>

      {/* Recent Payments */}
      <Grid item xs={12} md={6}>
        {/* TODO: Add RecentPayments component */}
      </Grid>

      {/* Service Revenue Breakdown */}
      <Grid item xs={12}>
        {/* TODO: Add ServiceRevenueBreakdown component */}
      </Grid>
    </Grid>
  )
}

export default FinanceDashboard
