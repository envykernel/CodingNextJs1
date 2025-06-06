'use client'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'

import type { ApexOptions } from 'apexcharts'

import CustomTextField from '@core/components/mui/TextField'
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'
import InvoiceStatusChart from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/components/InvoiceStatusChart'
import PaymentMethodsChart from '@/app/[lang]/(dashboard)/(private)/dashboards/finance/components/PaymentMethodsChart'

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
  const theme = useTheme()

  const formatCurrency = (val: string | number | number[]): string => {
    if (typeof val === 'number') {
      if (isNaN(val)) return '€0.00'

      return val.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })
    }

    if (Array.isArray(val)) {
      return val.map(v => (typeof v === 'number' ? formatCurrency(v) : '€0.00')).join(', ')
    }

    return '€0.00'
  }

  const formatDate = (value: string) => {
    const date = new Date(value)

    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  // Define chart colors with explicit hex values
  const chartColors = {
    // Use explicit hex values that work well in both light and dark modes
    invoiced: '#7367f0', // Primary color
    paid: '#28c76f', // Success color
    grid: theme.palette.mode === 'dark' ? '#2c3e50' : '#e0e0e0',
    text: theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
    background: 'transparent'
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
              <CustomTextField
                select
                defaultValue='month'
                size='small'
                sx={{
                  width: '120px',
                  '& .MuiSelect-select': {
                    color: chartColors.text
                  }
                }}
              >
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
                  toolbar: { show: false },
                  background: chartColors.background,
                  fontFamily: theme.typography.fontFamily
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '45%',
                    borderRadius: 8,
                    dataLabels: {
                      position: 'top'
                    }
                  }
                },
                dataLabels: {
                  enabled: true,
                  formatter: formatCurrency,
                  style: {
                    fontSize: '12px',
                    colors: [chartColors.text]
                  },
                  offsetY: -20
                },
                stroke: {
                  show: true,
                  width: 2,
                  colors: ['transparent']
                },
                colors: [chartColors.invoiced, chartColors.paid],
                xaxis: {
                  categories: chartData.months,
                  labels: {
                    formatter: formatDate,
                    style: {
                      colors: chartColors.text,
                      fontSize: '12px'
                    }
                  },
                  axisBorder: {
                    show: true,
                    color: chartColors.grid
                  },
                  axisTicks: {
                    show: true,
                    color: chartColors.grid
                  }
                },
                yaxis: {
                  labels: {
                    formatter: formatCurrency,
                    style: {
                      colors: chartColors.text,
                      fontSize: '12px'
                    }
                  },
                  axisBorder: {
                    show: true,
                    color: chartColors.grid
                  },
                  axisTicks: {
                    show: true,
                    color: chartColors.grid
                  }
                },
                grid: {
                  borderColor: chartColors.grid,
                  strokeDashArray: 4,
                  xaxis: {
                    lines: {
                      show: true
                    }
                  },
                  yaxis: {
                    lines: {
                      show: true
                    }
                  }
                },
                fill: {
                  opacity: 0.9,
                  type: 'solid'
                },
                tooltip: {
                  theme: theme.palette.mode,
                  y: {
                    formatter: formatCurrency
                  },
                  style: {
                    fontSize: '12px',
                    fontFamily: theme.typography.fontFamily
                  }
                },
                legend: {
                  position: 'top',
                  horizontalAlign: 'right',
                  labels: {
                    colors: chartColors.text
                  },
                  markers: {
                    width: 12,
                    height: 12,
                    offsetX: 0,
                    offsetY: 0
                  },
                  itemMargin: {
                    horizontal: 10,
                    vertical: 5
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Methods Distribution */}
      <PaymentMethodsChart data={paymentMethodsData} />

      {/* Invoice Status Chart */}
      <InvoiceStatusChart data={invoiceStatusData} />
    </>
  )
}

export default FinanceCharts
