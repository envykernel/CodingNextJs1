'use client'

// Component Imports
import { useEffect, useState } from 'react'

import { useTranslation } from '@/contexts/translationContext'

import PatientStatistics from '@components/patient-statistics/PatientStatistics'
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Type Imports
import type { PatientStatisticsType } from '@/app/server/patientStatisticsActions'

const PatientListCards = () => {
  const [statistics, setStatistics] = useState<UserDataType[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/patient-statistics')

        if (!response.ok) throw new Error('Failed to fetch statistics')

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
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [t])

  if (loading) {
    return <div>Loading statistics...</div>
  }

  return <PatientStatistics data={statistics} />
}

export default PatientListCards
