'use client'

// React Imports
import { useEffect, useState, useRef } from 'react'

import dynamic from 'next/dynamic'

import { format } from 'date-fns'

// Next Imports

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

// Type Imports

interface Payment {
  id: number
  amount: number
  payment_date: string
  payment_method: string
  patient: {
    name: string
  }
  applications: Array<{
    amount_applied: number
    invoice: {
      id: number
      total_amount: number
      payment_status: string
    }
    invoice_line?: {
      service: {
        id: number
        name: string
        amount: number
      }
    }
  }>
}

interface DailyStats {
  date: string
  total: number
  paid: number
  remaining: number
}

interface MethodStats {
  method: string
  amount: number
}

interface ServiceStats {
  service: string
  amount: number
}

const PaymentStatistics = () => {
  const theme = useTheme()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const processedInvoices = useRef<Set<number>>(new Set())

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!isMounted) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/payments/this-week', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        })

        if (!isMounted) return

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))

          throw new Error(errorData?.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!isMounted) return

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server')
        }

        setPayments(data)
      } catch (err) {
        if (!isMounted) return
        console.error('Error fetching payments:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch payments')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getDailyStats = (payments: Payment[]): DailyStats[] => {
    if (!Array.isArray(payments)) {
      console.error('Invalid payments data:', payments)

      return []
    }

    const dailyTotals = new Map<string, DailyStats>()

    processedInvoices.current.clear()

    // Initialize the last 7 days with zero values
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)

      date.setDate(date.getDate() - i)
      const dateStr = format(date, 'yyyy-MM-dd')

      dailyTotals.set(dateStr, { date: dateStr, total: 0, paid: 0, remaining: 0 })
    }

    // Process each payment
    payments.forEach(payment => {
      if (!payment?.payment_date) {
        console.warn('Skipping payment with invalid date:', payment)

        return
      }

      try {
        const dateStr = format(new Date(payment.payment_date), 'yyyy-MM-dd')
        const stats = dailyTotals.get(dateStr)

        if (!stats) {
          console.warn('No stats found for date:', dateStr)

          return
        }

        // Add the payment amount to paid
        const paymentAmount = Number(payment.amount) || 0

        stats.paid += paymentAmount

        // Process each payment application to calculate total and remaining
        if (Array.isArray(payment.applications)) {
          payment.applications.forEach(app => {
            if (!app?.invoice?.id || !app?.invoice?.total_amount) {
              console.warn('Skipping invalid application:', app)

              return
            }

            // Add to total if this is the first time we see this invoice
            if (!processedInvoices.current.has(app.invoice.id)) {
              const invoiceAmount = Number(app.invoice.total_amount) || 0

              stats.total += invoiceAmount
              processedInvoices.current.add(app.invoice.id)
            }
          })
        }

        // Calculate remaining amount
        stats.remaining = Math.max(0, stats.total - stats.paid)
        dailyTotals.set(dateStr, stats)
      } catch (err) {
        console.error('Error processing payment:', err, payment)
      }
    })

    return Array.from(dailyTotals.values())
  }

  const getMethodStats = (): MethodStats[] => {
    if (!Array.isArray(payments)) {
      console.error('Invalid payments data:', payments)

      return []
    }

    const methodTotals = new Map<string, number>()

    payments.forEach(payment => {
      if (!payment?.payment_method) {
        console.warn('Skipping payment with invalid method:', payment)

        return
      }

      try {
        const method = payment.payment_method.replace('_', ' ')
        const current = methodTotals.get(method) || 0
        const amount = Number(payment.amount) || 0

        methodTotals.set(method, current + amount)
      } catch (err) {
        console.error('Error processing payment method:', err, payment)
      }
    })

    return Array.from(methodTotals.entries())
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const getServiceStats = (): ServiceStats[] => {
    if (!Array.isArray(payments)) {
      console.error('Invalid payments data:', payments)

      return []
    }

    const serviceTotals = new Map<string, number>()

    payments.forEach(payment => {
      if (!Array.isArray(payment.applications)) {
        console.warn('Skipping payment with invalid applications:', payment)

        return
      }

      try {
        payment.applications.forEach(app => {
          if (!app?.invoice_line?.service) {
            console.warn('Skipping application without service:', app)

            return
          }

          const service = app.invoice_line.service
          const current = serviceTotals.get(service.name) || 0
          const amount = Number(app.amount_applied) || 0

          serviceTotals.set(service.name, current + amount)
        })
      } catch (err) {
        console.error('Error processing service:', err, payment)
      }
    })

    return Array.from(serviceTotals.entries())
      .map(([service, amount]) => ({ service, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const dailyStats = getDailyStats(payments)
  const methodStats = getMethodStats()
  const serviceStats = getServiceStats()

  const barOptions: ApexOptions = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: value => formatAmount(Math.abs(value))
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (value: number) => formatAmount(Math.abs(value)),
      style: {
        fontSize: '11px',
        fontWeight: 500,
        colors: ['var(--mui-palette-common-white)']
      },
      offsetY: 0
    },
    stroke: {
      width: 6,
      colors: ['var(--mui-palette-background-paper)']
    },
    colors: ['var(--mui-palette-success-main)', 'var(--mui-palette-error-main)'],
    legend: {
      offsetY: -4,
      offsetX: -35,
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '13px',
      fontFamily: theme.typography.fontFamily,
      labels: { colors: 'var(--mui-palette-text-secondary)' },
      itemMargin: {
        horizontal: 9
      },
      markers: {
        width: 12,
        height: 12,
        radius: 10,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 7 : -4
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 7,
        columnWidth: '40%',
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all',
        dataLabels: {
          hideOverflowingLabels: true,
          orientation: 'horizontal'
        }
      }
    },
    grid: {
      borderColor: 'var(--mui-palette-divider)',
      yaxis: {
        lines: { show: false }
      },
      padding: {
        left: -6,
        right: -11,
        bottom: -11,
        top: 0 // Removed top padding since we're centering the labels
      }
    },
    xaxis: {
      axisTicks: { show: false },
      crosshairs: { opacity: 0 },
      axisBorder: { show: false },
      categories: dailyStats.map(day => format(new Date(day.date), 'EEE dd')),
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -14,
        formatter: value => formatAmount(Math.abs(value)),
        style: {
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.body2.fontSize as string
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          plotOptions: {
            bar: { columnWidth: '48%' }
          },
          dataLabels: {
            style: {
              fontSize: '10px'
            }
          }
        }
      },
      {
        breakpoint: 1380,
        options: {
          plotOptions: {
            bar: { columnWidth: '55%' }
          },
          dataLabels: {
            style: {
              fontSize: '9px'
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          plotOptions: {
            bar: { borderRadius: 7 }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          plotOptions: {
            bar: { columnWidth: '50%' }
          },
          dataLabels: {
            style: {
              fontSize: '8px'
            }
          }
        }
      },
      {
        breakpoint: 680,
        options: {
          plotOptions: {
            bar: { columnWidth: '60%' }
          },
          dataLabels: {
            enabled: false
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          plotOptions: {
            bar: { columnWidth: '55%' }
          },
          dataLabels: {
            enabled: false
          }
        }
      },
      {
        breakpoint: 450,
        options: {
          plotOptions: {
            bar: { borderRadius: 6, columnWidth: '65%' }
          },
          dataLabels: {
            enabled: false
          }
        }
      }
    ]
  }

  const barSeries = [
    {
      name: 'Paid Amount',
      data: dailyStats.map(day => day.paid)
    },
    {
      name: 'Balance',
      data: dailyStats.map(day => day.remaining)
    }
  ]

  const donutOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    stroke: {
      width: 0
    },
    colors: [
      'var(--mui-palette-success-main)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.8)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.6)',
      'rgba(var(--mui-palette-success-mainChannel) / 0.4)'
    ],
    legend: {
      show: true,
      position: 'bottom',
      offsetY: 10,
      markers: {
        width: 8,
        height: 8,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 8 : -4
      },
      itemMargin: {
        horizontal: 15,
        vertical: 5
      },
      fontSize: '13px',
      fontWeight: 400,
      labels: {
        colors: 'var(--mui-palette-text-secondary)',
        useSeriesColors: false
      }
    },
    grid: {
      padding: {
        top: 15
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            value: {
              fontSize: '24px',
              color: 'var(--mui-palette-text-primary)',
              fontWeight: 500,
              offsetY: -20,
              formatter: (val: string) => formatAmount(Number(val))
            },
            name: {
              offsetY: 20,
              color: 'var(--mui-palette-text-secondary)'
            },
            total: {
              show: true,
              fontSize: '0.9375rem',
              fontWeight: 400,
              label: 'Total Amount',
              color: 'var(--mui-palette-text-secondary)',
              formatter: (w: any) => formatAmount(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0))
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (value: number) => formatAmount(value)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight={400}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' flexDirection='column' alignItems='center' gap={2} minHeight={400}>
            <Typography color='error' variant='h6'>
              Error Loading Payment Statistics
            </Typography>
            <Typography color='error' variant='body2'>
              {error}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (!Array.isArray(payments) || payments.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display='flex' flexDirection='column' alignItems='center' gap={2} minHeight={400}>
            <Typography variant='h6' color='text.secondary'>
              No Payment Data Available
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              There are no payments recorded for this week.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.main
              }}
            >
              <i className='tabler-chart-bar text-xl' />
            </Box>
            <Box>
              <Typography variant='h5'>Payment Statistics</Typography>
              <Typography variant='subtitle2' color='text.secondary'>
                This Week&apos;s Overview
              </Typography>
            </Box>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={0}>
          <Grid item xs={12} md={7.2}>
            <Box className='flex flex-col gap-4' sx={{ pr: 3 }}>
              <Box className='flex items-center justify-between'>
                <Typography variant='subtitle1'>Daily Payment Totals</Typography>
                <Box className='flex items-center gap-4'>
                  <Typography variant='subtitle2' color='success.main'>
                    Paid: {formatAmount(dailyStats.reduce((sum, day) => sum + day.paid, 0))}
                  </Typography>
                  <Typography variant='subtitle2' color='error.main'>
                    Balance: {formatAmount(dailyStats.reduce((sum, day) => sum + day.remaining, 0))}
                  </Typography>
                </Box>
              </Box>
              <AppReactApexCharts type='bar' height={400} width='100%' series={barSeries} options={barOptions} />
            </Box>
          </Grid>
          <Grid item xs={12} md={0.1} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Divider orientation='vertical' flexItem sx={{ height: '100%', my: 2 }} />
          </Grid>
          <Grid item xs={12} md={4.7}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pl: 3 }}>
              <Box>
                <Typography variant='subtitle1' sx={{ mb: 2 }}>
                  Payment Methods
                </Typography>
                <AppReactApexCharts
                  type='donut'
                  height={250}
                  width='100%'
                  series={methodStats.map(stat => stat.amount)}
                  options={{
                    ...donutOptions,
                    labels: methodStats.map(stat => stat.method)
                  }}
                />
              </Box>
              <Box>
                <Typography variant='subtitle1' sx={{ mb: 2 }}>
                  Services
                </Typography>
                <AppReactApexCharts
                  type='donut'
                  height={250}
                  width='100%'
                  series={serviceStats.map(stat => stat.amount)}
                  options={{
                    ...donutOptions,
                    labels: serviceStats.map(stat => stat.service)
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PaymentStatistics
