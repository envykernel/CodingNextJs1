'use client'

import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import { useSession } from 'next-auth/react'

import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'
import { getInvoiceStatusData } from '../actions'
import { useTranslation } from '@/contexts/translationContext'

const InvoiceStatusChart = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const { t } = useTranslation()
  const [data, setData] = useState<{ series: number[] }>({ series: [0, 0, 0] })

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.organisationId) {
        const invoiceStatusData = await getInvoiceStatusData(Number(session.user.organisationId))

        setData(invoiceStatusData)
      }
    }

    fetchData()
  }, [session?.user?.organisationId])

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
        <CardHeader title={t('paymentStatistics.invoiceStatus.title')} />
        <CardContent>
          <AppReactApexCharts
            type='donut'
            height={350}
            series={data.series}
            options={{
              chart: {
                background: 'transparent'
              },
              labels: [
                t('invoice.paymentStatus.paid'),
                t('invoice.paymentStatus.partial'),
                t('invoice.paymentStatus.pending')
              ],
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
                        label: t('paymentStatistics.invoiceStatus.totalInvoices'),
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
