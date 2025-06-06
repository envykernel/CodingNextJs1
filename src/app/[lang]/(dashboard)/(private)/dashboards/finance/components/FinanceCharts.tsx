'use client'

import Grid from '@mui/material/Grid2'

import InvoiceStatusChart from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/components/InvoiceStatusChart'
import PaymentMethodsChart from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/components/PaymentMethodsChart'
import ServiceRevenueChart from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/components/ServiceRevenueChart'
import MonthlyRevenueChart from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/components/MonthlyRevenueChart'

interface FinanceChartsProps {
  paymentMethodsData: {
    series: number[]
    labels: string[]
  }
}

const FinanceCharts = ({ paymentMethodsData }: FinanceChartsProps) => {
  return (
    <Grid container spacing={6}>
      {/* Monthly Revenue Chart */}
      <MonthlyRevenueChart />

      {/* Payment Methods Chart */}
      <PaymentMethodsChart data={paymentMethodsData} />

      {/* Invoice Status Chart */}
      <InvoiceStatusChart />

      {/* Service Revenue Chart */}
      <ServiceRevenueChart />
    </Grid>
  )
}

export default FinanceCharts
