import { prisma } from '@/prisma/prisma'

export type PatientStatisticsType = {
  newPatients: {
    monthly: {
      count: number
      percentageChange: number
      trend: 'positive' | 'negative'
    }
    yearly: {
      count: number
      percentageChange: number
      trend: 'positive' | 'negative'
    }
  }
  disabledPatients: {
    monthly: {
      count: number
      percentageChange: number
      trend: 'positive' | 'negative'
    }
    yearly: {
      count: number
      percentageChange: number
      trend: 'positive' | 'negative'
    }
  }
}

export async function getPatientStatistics(organisationId: number): Promise<PatientStatisticsType> {
  // Get the current date and calculate relevant date ranges
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDay = now.getDate()

  // Monthly date ranges
  const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1)
  const firstDayOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1)

  // Yearly date ranges
  const firstDayOfCurrentYear = new Date(currentYear, 0, 1)
  const firstDayOfPreviousYear = new Date(currentYear - 1, 0, 1)
  const currentDate = new Date(currentYear, currentMonth, currentDay)
  const previousYearSameDate = new Date(currentYear - 1, currentMonth, currentDay)

  // Get new patients for current month
  const newPatientsCurrentMonth = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      created_at: {
        gte: firstDayOfCurrentMonth
      }
    }
  })

  // Get new patients for previous month
  const newPatientsPreviousMonth = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      created_at: {
        gte: firstDayOfPreviousMonth,
        lt: firstDayOfCurrentMonth
      }
    }
  })

  // Get new patients for current year (up to current date)
  const newPatientsCurrentYear = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      created_at: {
        gte: firstDayOfCurrentYear,
        lte: currentDate
      }
    }
  })

  // Get new patients for previous year (up to same date)
  const newPatientsPreviousYear = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      created_at: {
        gte: firstDayOfPreviousYear,
        lte: previousYearSameDate
      }
    }
  })

  // Get disabled patients for current month
  const disabledPatientsCurrentMonth = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      status: 'disabled',
      updated_at: {
        gte: firstDayOfCurrentMonth
      }
    }
  })

  // Get disabled patients for previous month
  const disabledPatientsPreviousMonth = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      status: 'disabled',
      updated_at: {
        gte: firstDayOfPreviousMonth,
        lt: firstDayOfCurrentMonth
      }
    }
  })

  // Get disabled patients for current year (up to current date)
  const disabledPatientsCurrentYear = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      status: 'disabled',
      updated_at: {
        gte: firstDayOfCurrentYear,
        lte: currentDate
      }
    }
  })

  // Get disabled patients for previous year (up to same date)
  const disabledPatientsPreviousYear = await prisma.patient.count({
    where: {
      organisation_id: organisationId,
      status: 'disabled',
      updated_at: {
        gte: firstDayOfPreviousYear,
        lte: previousYearSameDate
      }
    }
  })

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
      // If previous was 0 and current is positive, return 100 to indicate increase
      // If previous was 0 and current is 0, return 0 to indicate no change
      return current > 0 ? 100 : 0
    }

    return ((current - previous) / previous) * 100
  }

  // Calculate monthly changes
  const newPatientsMonthlyPercentageChange = calculatePercentageChange(
    newPatientsCurrentMonth,
    newPatientsPreviousMonth
  )

  const disabledPatientsMonthlyPercentageChange = calculatePercentageChange(
    disabledPatientsCurrentMonth,
    disabledPatientsPreviousMonth
  )

  // Calculate yearly changes
  const newPatientsYearlyPercentageChange = calculatePercentageChange(newPatientsCurrentYear, newPatientsPreviousYear)

  const disabledPatientsYearlyPercentageChange = calculatePercentageChange(
    disabledPatientsCurrentYear,
    disabledPatientsPreviousYear
  )

  // Helper function to determine trend for disabled patients
  const getDisabledPatientsTrend = (current: number, previous: number) => {
    // If current is greater than previous, it's a negative trend (red)
    if (current > previous) return 'negative'

    // If current is less than previous, it's a positive trend (green)
    if (current < previous) return 'positive'

    // If they're equal, it's a positive trend (green)
    return 'positive'
  }

  return {
    newPatients: {
      monthly: {
        count: newPatientsCurrentMonth,
        percentageChange: newPatientsMonthlyPercentageChange,
        trend: newPatientsMonthlyPercentageChange >= 0 ? 'positive' : 'negative'
      },
      yearly: {
        count: newPatientsCurrentYear,
        percentageChange: newPatientsYearlyPercentageChange,
        trend: newPatientsYearlyPercentageChange >= 0 ? 'positive' : 'negative'
      }
    },
    disabledPatients: {
      monthly: {
        count: disabledPatientsCurrentMonth,
        percentageChange: disabledPatientsMonthlyPercentageChange,
        trend: getDisabledPatientsTrend(disabledPatientsCurrentMonth, disabledPatientsPreviousMonth)
      },
      yearly: {
        count: disabledPatientsCurrentYear,
        percentageChange: disabledPatientsYearlyPercentageChange,
        trend: getDisabledPatientsTrend(disabledPatientsCurrentYear, disabledPatientsPreviousYear)
      }
    }
  }
}
