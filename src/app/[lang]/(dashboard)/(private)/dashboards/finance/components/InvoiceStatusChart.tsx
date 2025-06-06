'use client'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'

interface InvoiceStatusChartProps {
  data: {
    series: number[]
  }
}

const InvoiceStatusChart = ({ data }: InvoiceStatusChartProps) => {
  const theme = useTheme()

  // Define chart colors with fallback hex values
  const chartColors = {
    // Use hex values that work well in both light and dark modes
    paid: '#28c76f', // Success green
    partial: '#ff9f43', // Warning orange
    pending: '#ea5455', // Error red
    text: theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
    background: theme.palette.mode === 'dark' ? '#2c3e50' : '#fff'
  }

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardHeader title='Invoice Status' />
        <CardContent>
          <AppReactApexCharts
            type='donut'
            height={350}
            series={data.series}
            options={{
              chart: {
                background: 'transparent'
              },
              labels: ['Paid', 'Partial', 'Pending'],
              legend: {
                position: 'bottom',
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
              },
              colors: [chartColors.paid, chartColors.partial, chartColors.pending],
              plotOptions: {
                pie: {
                  donut: {
                    size: '65%',
                    background: 'transparent',
                    labels: {
                      show: true,
                      name: {
                        show: true,
                        fontSize: '14px',
                        fontFamily: theme.typography.fontFamily,
                        color: chartColors.text
                      },
                      value: {
                        show: true,
                        fontSize: '24px',
                        fontWeight: 600,
                        fontFamily: theme.typography.fontFamily,
                        color: chartColors.text,
                        formatter: value => value.toString()
                      },
                      total: {
                        show: true,
                        label: 'Total Invoices',
                        fontSize: '14px',
                        fontWeight: 400,
                        fontFamily: theme.typography.fontFamily,
                        color: chartColors.text,
                        formatter: (w: { globals: { seriesTotals: number[] } }) => {
                          const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)

                          return total.toString()
                        }
                      }
                    }
                  }
                }
              },
              dataLabels: {
                enabled: true,
                formatter: (val: number) => `${val}%`,
                style: {
                  fontSize: '14px',
                  fontFamily: theme.typography.fontFamily,
                  colors: [chartColors.text]
                },
                dropShadow: {
                  enabled: false
                }
              },
              stroke: {
                width: 0
              },
              tooltip: {
                theme: theme.palette.mode,
                y: {
                  formatter: (value: number) => `${value} invoices`
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </Grid>
  )
}

export default InvoiceStatusChart
