'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import PatientStatistics from '@components/patient-statistics/PatientStatistics'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import type { PatientStatisticsType } from '@/app/server/patientStatisticsActions'

// Context Imports
import { useTranslation } from '@/contexts/translationContext'

const StatisticsSkeleton = () => {
  return (
    <Grid container spacing={6}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant='circular' width={40} height={40} sx={{ mr: 4 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Skeleton variant='text' width='60%' height={32} sx={{ mb: 1 }} />
                  <Skeleton variant='text' width='40%' height={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

const OrganisationDashboardPatientStatistics = () => {
  const { t } = useTranslation()
  const [statistics, setStatistics] = useState<UserDataType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setError(null)
        const response = await fetch('/api/patient-statistics')

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred' }))

          // Map HTTP status codes to user-friendly messages
          const errorMessages: Record<number, { title: string; message: string }> = {
            401: {
              title: t('errors.unauthorized.title'),
              message: t('errors.unauthorized.message')
            },
            400: {
              title: t('errors.organization.title'),
              message: t('errors.organization.message')
            },
            503: {
              title: t('errors.database.title'),
              message: t('errors.database.message')
            },
            504: {
              title: t('errors.timeout.title'),
              message: t('errors.timeout.message')
            },
            500: {
              title: t('errors.generic.title'),
              message: t('errors.generic.message')
            }
          }

          const errorInfo = errorMessages[response.status] || {
            title: t('errors.generic.title'),
            message: errorData.message || t('errors.generic.message')
          }

          setError(errorInfo)
          return
        }

        const data: PatientStatisticsType = await response.json()

        setStatistics([
          {
            title: t('patient.statistics.newPatients'),
            stats: data.newPatients.monthly.count.toString(),
            avatarIcon: 'tabler-user-plus',
            avatarColor: 'success',
            trend: data.newPatients.monthly.trend,
            trendNumber: `${Math.abs(Math.round(data.newPatients.monthly.percentageChange))}%`,
            subtitle: t('patient.statistics.monthlyComparison')
          },
          {
            title: t('patient.statistics.newPatients'),
            stats: data.newPatients.yearly.count.toString(),
            avatarIcon: 'tabler-user-plus',
            avatarColor: 'success',
            trend: data.newPatients.yearly.trend,
            trendNumber: `${Math.abs(Math.round(data.newPatients.yearly.percentageChange))}%`,
            subtitle: t('patient.statistics.yearlyComparison')
          },
          {
            title: t('patient.statistics.disabledPatients'),
            stats: data.disabledPatients.monthly.count.toString(),
            avatarIcon: 'tabler-user-off',
            avatarColor: 'error',
            trend: data.disabledPatients.monthly.trend,
            trendNumber: `${Math.abs(Math.round(Math.abs(data.disabledPatients.monthly.percentageChange)))}%`,
            subtitle: t('patient.statistics.monthlyComparison')
          },
          {
            title: t('patient.statistics.disabledPatients'),
            stats: data.disabledPatients.yearly.count.toString(),
            avatarIcon: 'tabler-user-off',
            avatarColor: 'error',
            trend: data.disabledPatients.yearly.trend,
            trendNumber: `${Math.abs(Math.round(Math.abs(data.disabledPatients.yearly.percentageChange)))}%`,
            subtitle: t('patient.statistics.yearlyComparison')
          }
        ])
      } catch (error) {
        console.error('Error fetching patient statistics:', error)
        setError({
          title: t('errors.generic.title'),
          message: t('errors.generic.message')
        })
        setStatistics([])
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [t])

  if (loading) {
    return (
      <Grid item xs={12}>
        <StatisticsSkeleton />
      </Grid>
    )
  }

  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display='flex' flexDirection='column' alignItems='center' gap={2} minHeight={200}>
                <Typography color='error' variant='h6'>
                  {error.title}
                </Typography>
                <Typography color='error' variant='body1' align='center'>
                  {error.message}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid item xs={12}>
      <PatientStatistics data={statistics} />
    </Grid>
  )
}

export default OrganisationDashboardPatientStatistics
