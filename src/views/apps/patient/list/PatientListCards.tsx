'use client'

// Component Imports
import { useEffect, useState } from 'react'

import PatientStatistics from '@components/patient-statistics/PatientStatistics'
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Type Imports
import type { PatientStatisticsType } from '@/app/server/patientStatisticsActions'

const PatientListCards = () => {
  const [statistics, setStatistics] = useState<UserDataType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/patient-statistics')

        if (!response.ok) throw new Error('Failed to fetch statistics')

        const data: PatientStatisticsType = await response.json()

        setStatistics([
          {
            title: 'New Patients',
            stats: data.newPatients.monthly.count.toString(),
            avatarIcon: 'tabler-user-plus',
            avatarColor: 'success',
            trend: data.newPatients.monthly.trend,
            trendNumber: `${Math.abs(Math.round(data.newPatients.monthly.percentageChange))}%`,
            subtitle: 'This month vs last month'
          },
          {
            title: 'New Patients',
            stats: data.newPatients.yearly.count.toString(),
            avatarIcon: 'tabler-user-plus',
            avatarColor: 'success',
            trend: data.newPatients.yearly.trend,
            trendNumber: `${Math.abs(Math.round(data.newPatients.yearly.percentageChange))}%`,
            subtitle: 'This year vs last year'
          },
          {
            title: 'Disabled Patients',
            stats: data.disabledPatients.monthly.count.toString(),
            avatarIcon: 'tabler-user-off',
            avatarColor: 'error',
            trend: data.disabledPatients.monthly.trend,
            trendNumber: `${Math.abs(Math.round(data.disabledPatients.monthly.percentageChange))}%`,
            subtitle: 'This month vs last month'
          },
          {
            title: 'Disabled Patients',
            stats: data.disabledPatients.yearly.count.toString(),
            avatarIcon: 'tabler-user-off',
            avatarColor: 'error',
            trend: data.disabledPatients.yearly.trend,
            trendNumber: `${Math.abs(Math.round(data.disabledPatients.yearly.percentageChange))}%`,
            subtitle: 'This year vs last year'
          }
        ])
      } catch (error) {
        console.error('Error fetching patient statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return <div>Loading statistics...</div>
  }

  return <PatientStatistics data={statistics} />
}

export default PatientListCards
