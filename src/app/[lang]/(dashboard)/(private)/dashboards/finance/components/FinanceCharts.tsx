'use client'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'

import type { ApexOptions } from 'apexcharts'

import CustomTextField from '@core/components/mui/TextField'
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'
import InvoiceStatusChart from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/components/InvoiceStatusChart'

interface FinanceChartsProps {
  chartData: {
    months: string[]
    invoiced: number[]
    paid: number[]
  }
  paymentMethodsData: {
    series: number[]
    labels: string[]
  }
  invoiceStatusData: {
    series: number[]
  }
}

const FinanceCharts = ({ chartData, paymentMethodsData, invoiceStatusData }: FinanceChartsProps) => {
  const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })

  const formatDate = (value: string) => {
    const date = new Date(value)

    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  const monthlyRevenueSeries: ApexOptions['series'] = [
    {
      name: 'Invoiced',
      data: chartData.invoiced
    },
    {
      name: 'Paid',
      data: chartData.paid
    }
  ]

  return (
    <>
      {/* Monthly Revenue Chart */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Monthly Revenue'
            subheader='Last 12 months'
            action={
              <CustomTextField select defaultValue='month' size='small' sx={{ width: '120px' }}>
                <MenuItem value='day'>Daily</MenuItem>
                <MenuItem value='week'>Weekly</MenuItem>
                <MenuItem value='month'>Monthly</MenuItem>
                <MenuItem value='year'>Yearly</MenuItem>
                <MenuItem value='custom'>Custom</MenuItem>
              </CustomTextField>
            }
          />
          <CardContent>
            <AppReactApexCharts
              type='bar'
              height={400}
              series={monthlyRevenueSeries}
              options={{
                chart: {
                  type: 'bar',
                  stacked: false,
                  toolbar: { show: false }
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '45%',
                    borderRadius: 4
                  }
                },
                dataLabels: {
                  enabled: false
                },
                stroke: {
                  show: true,
                  width: 2,
                  colors: ['transparent']
                },
                xaxis: {
                  categories: chartData.months,
                  labels: {
                    formatter: formatDate
                  }
                },
                yaxis: {
                  labels: {
                    formatter: formatCurrency
                  }
                },
                fill: {
                  opacity: 1
                },
                tooltip: {
                  y: {
                    formatter: formatCurrency
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Methods Distribution */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardHeader title='Payment Methods' />
          <CardContent>
            <AppReactApexCharts
              type='donut'
              height={350}
              series={paymentMethodsData.series}
              options={{
                labels: paymentMethodsData.labels,
                legend: {
                  position: 'bottom'
                },
                tooltip: {
                  y: {
                    formatter: formatCurrency
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Invoice Status Chart */}
      <InvoiceStatusChart data={invoiceStatusData} />
    </>
  )
}

export default FinanceCharts
