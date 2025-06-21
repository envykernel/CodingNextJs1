'use client'

import { useEffect, useState } from 'react'
import type { SyntheticEvent } from 'react'

import { useSession } from 'next-auth/react'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import type { SelectChangeEvent } from '@mui/material/Select'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'

import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'
import { getServiceRevenueData } from '@/app/server/financeActions'
import { useTranslation } from '@/contexts/translationContext'

type ServiceRevenue = {
  serviceName: string
  totalRevenue: number
  monthlyRevenue: {
    month: string
    revenue: number
  }[]
}

type ServiceRevenueData = {
  services: ServiceRevenue[]
  totalRevenue: number
}

const ServiceRevenueChart = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const { t } = useTranslation()
  const [data, setData] = useState<ServiceRevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const ALL_SERVICES_KEY = '__ALL__'

  // Generate years array from current year to 5 years back
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

  // Helper function to get translated service name
  const getTranslatedServiceName = (serviceName: string): string => {
    // Convert service name to lowercase and remove spaces for matching
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '')

    // Try to get translation from the services object
    const translatedName = t(`financeDashboard.serviceRevenue.services.${serviceKey}`)

    // If translation exists and is different from the key, use it
    if (translatedName && translatedName !== `financeDashboard.serviceRevenue.services.${serviceKey}`) {
      return translatedName
    }

    // If no translation found, return original service name
    return serviceName
  }

  // Helper function to translate month names
  const getTranslatedMonth = (month: string): string => {
    // Map of English month abbreviations to their full names
    const monthMap: { [key: string]: string } = {
      Jan: 'january',
      Feb: 'february',
      Mar: 'march',
      Apr: 'april',
      May: 'may',
      Jun: 'june',
      Jul: 'july',
      Aug: 'august',
      Sep: 'september',
      Oct: 'october',
      Nov: 'november',
      Dec: 'december'
    }

    // Get the full month name from the abbreviation
    const fullMonth = monthMap[month]

    if (!fullMonth) return month

    // Get the translation for the month using the correct path
    const translatedMonth = t(`appointmentStatistics.dayStats.months.${fullMonth}`)

    // If translation exists and is different from the key, use it
    if (translatedMonth && translatedMonth !== `appointmentStatistics.dayStats.months.${fullMonth}`) {
      return translatedMonth
    }

    // If no translation found, return original month
    return month
  }

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.organisationId) {
        try {
          setLoading(true)
          setError(null)
          const result = await getServiceRevenueData(Number(session.user.organisationId), { year: selectedYear })

          setData(result)

          // Set 'All Services' as selected by default
          if (result.services.length > 0) {
            setSelectedService(ALL_SERVICES_KEY)
          }
        } catch (error) {
          console.error('Error fetching service revenue data:', error)
          setError(t('financeDashboard.serviceRevenue.error'))
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [session?.user?.organisationId, selectedYear, t])

  // Format currency helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'MAD',
      currencyDisplay: 'code'
    })
  }

  const handleServiceChange = (event: SyntheticEvent, newValue: string) => {
    setSelectedService(newValue)
  }

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(event.target.value as number)
  }

  const renderServiceTabs = () => {
    if (!data) return null

    // All Services tab
    const allTab = (
      <Tab
        key={ALL_SERVICES_KEY}
        value={ALL_SERVICES_KEY}
        sx={{ minWidth: 140, height: 44, fontWeight: 600, fontSize: '1rem', textTransform: 'none' }}
        label={
          <span className='w-full flex justify-center items-center'>
            {t('financeDashboard.serviceRevenue.allServices')}
          </span>
        }
      />
    )

    return [
      allTab,
      ...data.services.map((service, index) => (
        <Tab
          key={index}
          value={service.serviceName}
          sx={{ minWidth: 140, height: 44, fontWeight: 600, fontSize: '1rem', textTransform: 'none' }}
          label={
            <span className='w-full flex justify-center items-center'>
              {getTranslatedServiceName(service.serviceName)}
            </span>
          }
        />
      ))
    ]
  }

  const renderMonthlyChart = () => {
    if (!data || !selectedService) return null

    // If 'All Services' is selected, sum monthly revenue across all services
    let chartTitle = selectedService
    let totalRevenue = 0
    let monthlyData: { month: string; revenue: number }[] = []

    if (selectedService === ALL_SERVICES_KEY) {
      chartTitle = t('financeDashboard.serviceRevenue.allServices')

      // Collect all months from all services
      const allMonths = Array.from(new Set(data.services.flatMap(s => s.monthlyRevenue.map(m => m.month))))

      monthlyData = allMonths.map(month => ({
        month,
        revenue: data.services.reduce((sum, s) => {
          const found = s.monthlyRevenue.find(m => m.month === month)

          return sum + (found ? found.revenue : 0)
        }, 0)
      }))
      totalRevenue = data.services.reduce((sum, s) => sum + s.totalRevenue, 0)
    } else {
      const service = data.services.find(s => s.serviceName === selectedService)

      if (!service) return null
      monthlyData = service.monthlyRevenue
      totalRevenue = service.totalRevenue
      chartTitle = getTranslatedServiceName(service.serviceName)
    }

    const max = Math.max(...monthlyData.map(item => item.revenue))
    const seriesIndex = monthlyData.findIndex(item => item.revenue === max)

    const colors = monthlyData.map((_, i) =>
      i === seriesIndex ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-primary-lightOpacity)'
    )

    const yAxisMax = max > 0 ? max * 1.15 : undefined

    return (
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h6'>{chartTitle}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('financeDashboard.serviceRevenue.monthlyOverview')}
            </Typography>
          </div>
          <Typography variant='h5'>{formatCurrency(totalRevenue)}</Typography>
        </div>
        <AppReactApexCharts
          type='bar'
          height={350}
          width='100%'
          series={[{ data: monthlyData.map(item => item.revenue) }]}
          options={{
            chart: {
              parentHeightOffset: 0,
              toolbar: { show: false }
            },
            plotOptions: {
              bar: {
                borderRadius: 6,
                distributed: true,
                columnWidth: '33%',
                borderRadiusApplication: 'end',
                dataLabels: { position: 'top' }
              }
            },
            legend: { show: false },
            tooltip: { enabled: false },
            dataLabels: {
              offsetY: -11,
              formatter: (val: number) => formatCurrency(val),
              style: {
                fontWeight: 500,
                colors: ['var(--mui-palette-text-primary)'],
                fontSize: theme.typography.body1.fontSize as string
              }
            },
            colors,
            states: {
              hover: {
                filter: { type: 'none' }
              },
              active: {
                filter: { type: 'none' }
              }
            },
            grid: {
              show: false,
              padding: {
                top: -19,
                left: -4,
                right: 0,
                bottom: -11
              }
            },
            xaxis: {
              axisTicks: { show: false },
              axisBorder: { color: 'var(--mui-palette-divider)' },
              categories: monthlyData.map(item => getTranslatedMonth(item.month)),
              labels: {
                style: {
                  colors: 'var(--mui-palette-text-disabled)',
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.body2.fontSize as string
                }
              }
            },
            yaxis: {
              min: 0,
              max: yAxisMax,
              labels: {
                offsetX: -18,
                formatter: (val: number) => formatCurrency(val),
                style: {
                  colors: 'var(--mui-palette-text-disabled)',
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.body2.fontSize as string
                }
              }
            },
            responsive: [
              {
                breakpoint: 1450,
                options: {
                  plotOptions: {
                    bar: { columnWidth: '45%' }
                  }
                }
              },
              {
                breakpoint: 600,
                options: {
                  dataLabels: {
                    style: {
                      fontSize: theme.typography.body2.fontSize as string
                    }
                  },
                  plotOptions: {
                    bar: { columnWidth: '58%' }
                  }
                }
              },
              {
                breakpoint: 500,
                options: {
                  plotOptions: {
                    bar: { columnWidth: '70%' }
                  }
                }
              }
            ]
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={t('financeDashboard.serviceRevenue.title')}
            action={
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1,
                      px: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          />
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
          <CardHeader
            title={t('financeDashboard.serviceRevenue.title')}
            action={
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1,
                      px: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          />
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
          <CardHeader
            title={t('financeDashboard.serviceRevenue.title')}
            action={
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      py: 1,
                      px: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }
                  }}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          />
          <CardContent>
            <Box display='flex' justifyContent='center' alignItems='center' minHeight={350}>
              <Typography color='text.secondary'>{t('financeDashboard.serviceRevenue.noData')}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader
          title={t('financeDashboard.serviceRevenue.title')}
          subheader={t('financeDashboard.serviceRevenue.subtitle')}
          action={
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    py: 1,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
        />
        <CardContent className='flex flex-col gap-6'>
          <TabContext value={selectedService || ''}>
            <TabList
              variant='scrollable'
              scrollButtons='auto'
              onChange={handleServiceChange}
              aria-label={t('financeDashboard.serviceRevenue.serviceTabs')}
              className='!border-0 mbe-6'
            >
              {renderServiceTabs()}
            </TabList>
            {renderMonthlyChart()}
          </TabContext>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default ServiceRevenueChart
