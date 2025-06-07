'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

// Component Imports
import PatientStatistics from '@components/patient-statistics/PatientStatistics'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'
import type { PatientStatisticsType } from '@/app/server/patientStatisticsActions'

// Context Imports
import { useTranslation } from '@/contexts/translationContext'

const OrganisationDashboardPatientStatistics = () => {
  const { t } = useTranslation()
  const [statistics, setStatistics] = useState<UserDataType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setError(null)
        const response = await fetch('/api/patient-statistics')

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || `Failed to fetch statistics: ${response.status}`)
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
        setError(error instanceof Error ? error.message : 'Failed to fetch statistics')
        setStatistics([])
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [t])

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
    <Grid item xs={12}>
      <PatientStatistics data={statistics} />
    </Grid>
  )
}

export default OrganisationDashboardPatientStatistics
