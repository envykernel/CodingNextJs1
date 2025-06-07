'use client'

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'

import CustomAvatar from '@core/components/mui/Avatar'

import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'
import { getServiceRevenueData } from '../actions'

type ServiceRevenue = {
  serviceName: string
  totalRevenue: number
}

type ServiceRevenueData = {
  services: ServiceRevenue[]
  totalRevenue: number
}

const ServiceRevenueChart = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const [data, setData] = useState<ServiceRevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.organisationId) {
        try {
          setLoading(true)
          setError(null)
          const result = await getServiceRevenueData(Number(session.user.organisationId))

          setData(result as ServiceRevenueData)
        } catch (error) {
          console.error('Error fetching service revenue data:', error)
          setError('Failed to load service revenue data')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [session?.user?.organisationId])

  // Define chart colors with explicit hex values
  const chartColors = {
    primary: '#7367f0', // Primary color
    success: '#28c76f', // Success color
    warning: '#ff9f43', // Warning color
    error: '#ea5455', // Error color
    text: theme.palette.mode === 'dark' ? '#fff' : '#2c3e50',
    grid: theme.palette.mode === 'dark' ? '#2c3e50' : '#e0e0e0',
    background: 'transparent'
  }

  // Format currency helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'MAD',
      currencyDisplay: 'code'
    })
  }

  if (loading) {
    return (
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Service Revenue' />
          <CardContent>
            <Box display='flex' justifyContent='center' alignItems='center' minHeight={350}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Service Revenue' />
          <CardContent>
            <Box display='flex' justifyContent='center' alignItems='center' minHeight={350}>
              <Typography color='error'>{error}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  if (!data || data.services.length === 0) {
    return (
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Service Revenue' />
          <CardContent>
            <Box display='flex' justifyContent='center' alignItems='center' minHeight={350}>
              <Typography color='text.secondary'>No revenue data available</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  // Calculate percentage for each service
  const servicesWithPercentage = data.services.map(service => ({
    ...service,
    percentage: (service.totalRevenue / data.totalRevenue) * 100
  }))

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader title='Service Revenue' subheader='Revenue Distribution by Service' className='pbe-0' />
        <CardContent className='flex flex-col gap-5'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-8'>
            <div className='flex flex-col gap-3 is-full sm:is-[unset]'>
              <div className='flex items-center gap-2.5'>
                <Typography variant='h2'>{formatCurrency(data.totalRevenue)}</Typography>
                <Chip
                  size='small'
                  variant='tonal'
                  color='success'
                  label={`${servicesWithPercentage.length} Services`}
                />
              </div>
              <Typography variant='body2' className='text-balance'>
                Total revenue generated across all services
              </Typography>
            </div>
            <AppReactApexCharts
              type='bar'
              height={163}
              width='100%'
              series={[{ data: data.services.map(item => item.totalRevenue) }]}
              options={{
                chart: {
                  parentHeightOffset: 0,
                  toolbar: { show: false }
                },
                tooltip: { enabled: false },
                grid: {
                  show: false,
                  padding: {
                    top: -31,
                    left: 0,
                    right: 0,
                    bottom: -9
                  }
                },
                plotOptions: {
                  bar: {
                    borderRadius: 4,
                    distributed: true,
                    columnWidth: '42%'
                  }
                },
                legend: { show: false },
                dataLabels: { enabled: false },
                colors: data.services.map(() => chartColors.primary),
                states: {
                  hover: {
                    filter: { type: 'none' }
                  },
                  active: {
                    filter: { type: 'none' }
                  }
                },
                xaxis: {
                  categories: data.services.map(item => item.serviceName),
                  axisTicks: { show: false },
                  axisBorder: { show: false },
                  labels: {
                    style: {
                      fontSize: '13px',
                      colors: 'var(--mui-palette-text-disabled)'
                    }
                  }
                },
                yaxis: { show: false }
              }}
            />
          </div>
          <div className='flex flex-col sm:flex-row gap-6 p-5 border rounded'>
            {servicesWithPercentage.map((service, index) => (
              <div key={index} className='flex flex-col gap-2 is-full'>
                <div className='flex items-center gap-2'>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    color={index === 0 ? 'primary' : index === 1 ? 'success' : 'warning'}
                    size={26}
                  >
                    <Typography variant='caption' className='font-medium'>
                      MAD
                    </Typography>
                  </CustomAvatar>
                  <Typography variant='h6' className='leading-6 font-normal'>
                    {service.serviceName}
                  </Typography>
                </div>
                <Typography variant='h4'>{formatCurrency(service.totalRevenue)}</Typography>
                <LinearProgress
                  value={service.percentage}
                  variant='determinate'
                  color={index === 0 ? 'primary' : index === 1 ? 'success' : 'warning'}
                  className='max-bs-1'
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default ServiceRevenueChart
