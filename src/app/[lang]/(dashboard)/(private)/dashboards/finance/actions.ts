'use server'

import type { Decimal } from '@prisma/client/runtime/library'

import { prisma } from '@/libs/prisma'

type Period = 'This Week' | 'This Month' | 'This Year'
type FilterType = 'daily' | 'weekly' | 'monthly'
type ComparisonType = 'average_monthly' | 'previous_period'

export async function getInvoiceStatusData(organisationId: number) {
  const invoices = await prisma.invoice.findMany({
    where: {
      organisation_id: organisationId,
      record_status: 'ACTIVE'
    }
  })

  return {
    series: [
      invoices.filter(inv => inv.payment_status === 'PAID').length,
      invoices.filter(inv => inv.payment_status === 'PARTIAL').length,
      invoices.filter(inv => inv.payment_status === 'PENDING').length
    ]
  }
}

export const getServiceRevenueData = async (organisationId: number) => {
  try {
    // Get date range for current year up to current month
    const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    const currentDate = new Date()
    const endOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    // Get payments with their applications and service information
    const payments = await prisma.payment.findMany({
      where: {
        organisation_id: organisationId,
        payment_date: {
          gte: startOfYear,
          lte: endOfCurrentMonth
        }
      },
      select: {
        id: true,
        payment_date: true,
        applications: {
          select: {
            id: true,
            amount_applied: true,
            invoice_line: {
              select: {
                id: true,
                service: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        payment_date: 'asc'
      }
    })

    // Debug log to see the raw data
    console.log('Raw payment data:', JSON.stringify(payments, null, 2))

    // Initialize monthly revenue map for each service
    const serviceRevenueMap = new Map<
      string,
      {
        totalRevenue: number
        monthlyRevenue: Map<string, number> // Using Map to ensure we don't duplicate months
        paymentCount: number
      }
    >()

    // Process each payment and its applications
    payments.forEach(payment => {
      const paymentMonth = payment.payment_date.toLocaleString('default', { month: 'short' })

      // Debug log for each payment
      console.log(`Processing payment ${payment.id}:`, {
        date: payment.payment_date,
        month: paymentMonth,
        applications: payment.applications.map(app => ({
          amount: app.amount_applied,
          service: app.invoice_line?.service?.name
        }))
      })

      payment.applications.forEach(app => {
        if (app.invoice_line?.service?.name) {
          const serviceName = app.invoice_line.service.name
          const amount = Number(app.amount_applied)

          // Get or create service data
          let serviceData = serviceRevenueMap.get(serviceName)

          if (!serviceData) {
            serviceData = {
              totalRevenue: 0,
              monthlyRevenue: new Map(),
              paymentCount: 0
            }
            serviceRevenueMap.set(serviceName, serviceData)
          }

          // Update total revenue
          serviceData.totalRevenue += amount
          serviceData.paymentCount += 1

          // Update monthly revenue for the specific month of this payment
          const currentMonthRevenue = serviceData.monthlyRevenue.get(paymentMonth) || 0

          serviceData.monthlyRevenue.set(paymentMonth, currentMonthRevenue + amount)
        }
      })
    })

    // Debug log for service revenue map
    console.log(
      'Service revenue map:',
      Array.from(serviceRevenueMap.entries()).map(([name, data]) => ({
        service: name,
        totalRevenue: data.totalRevenue,
        paymentCount: data.paymentCount,
        monthlyRevenue: Object.fromEntries(data.monthlyRevenue)
      }))
    )

    // Convert to array format and filter out services with zero revenue
    const serviceData = Array.from(serviceRevenueMap.entries())
      .filter(([, data]) => data.totalRevenue > 0) // Only keep services with revenue > 0
      .map(([serviceName, data]) => ({
        serviceName,
        totalRevenue: data.totalRevenue,
        monthlyRevenue: Array.from(data.monthlyRevenue.entries())
          .map(([month, revenue]) => ({
            month,
            revenue
          }))
          .sort((a, b) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            return months.indexOf(a.month) - months.indexOf(b.month)
          })
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Calculate total revenue
    const totalRevenue = serviceData.reduce((sum, service) => sum + service.totalRevenue, 0)

    // Debug log for final data
    console.log('Final service data:', serviceData)
    console.log('Total revenue:', totalRevenue)

    return {
      services: serviceData,
      totalRevenue
    }
  } catch (error) {
    console.error('Error fetching service revenue data:', error)
    throw new Error('Failed to fetch service revenue data')
  }
}

type DateRange = {
  start: Date
  end: Date
  label: string
}

type PaymentApplication = {
  id: number
  amount_applied: Decimal
  payment: {
    id: number
    payment_date: Date
    payment_method: string
  }
}

type MonthlyRevenueResponse = {
  totalRevenue: number
  growth: number
  breakdown: {
    period: string
    totalPaid: number
  }[]
  invoices: {
    id: number
    invoiceNumber: string
    patientName: string
    totalAmount: number
    totalPaid: number
    paidPercentage: number
    status: string
    date: Date
  }[]
  period: Period
  comparisonType: 'average_monthly' | 'previous_period'
}

export async function getMonthlyRevenueData(organisationId: number, period: Period): Promise<MonthlyRevenueResponse> {
  try {
    const now = new Date()
    let startDate: Date
    const endDate: Date = now
    let previousStartDate: Date
    let previousEndDate: Date

    // Calculate start date based on period
    switch (period) {
      case 'This Week':
        // Start of current week (Sunday)
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)

        // Previous week
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(startDate.getDate() - 7)
        previousEndDate = new Date(startDate)
        previousEndDate.setDate(startDate.getDate() - 1)
        break
      case 'This Month':
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)

        // For monthly comparison, get all previous months of the current year
        previousStartDate = new Date(now.getFullYear(), 0, 1) // Start of year
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0) // End of previous month
        break
      case 'This Year':
        // Start of current year
        startDate = new Date(now.getFullYear(), 0, 1)

        // Previous year
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), 0, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
    }

    // Get invoices for current period
    const invoices = await prisma.invoice.findMany({
      where: {
        organisation_id: organisationId,
        record_status: 'ACTIVE',
        invoice_date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        patient: true,
        payment_apps: {
          select: {
            id: true,
            amount_applied: true,
            payment: {
              select: {
                id: true,
                payment_date: true,
                payment_method: true
              }
            }
          }
        }
      }
    })

    // Process current period invoices
    const processedInvoices = invoices.map(invoice => {
      const totalPaid = invoice.payment_apps.reduce(
        (sum: number, paymentApp) => sum + Number(paymentApp.amount_applied),
        0
      )

      const totalAmount = Number(invoice.total_amount)
      const paidPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        patientName: invoice.patient?.name || 'Unknown',
        totalAmount,
        totalPaid,
        paidPercentage,
        status: invoice.payment_status,
        date: invoice.invoice_date
      }
    })

    // Get invoices for previous period
    const previousPeriodInvoices = await prisma.invoice.findMany({
      where: {
        organisation_id: organisationId,
        record_status: 'ACTIVE',
        invoice_date: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      },
      include: {
        payment_apps: {
          select: {
            id: true,
            amount_applied: true,
            payment: {
              select: {
                id: true,
                payment_date: true,
                payment_method: true
              }
            }
          }
        }
      }
    })

    // Calculate previous period total
    const previousPeriodPaid = previousPeriodInvoices.reduce((sum, invoice) => {
      const paid = invoice.payment_apps.reduce(
        (paymentSum, paymentApp) => paymentSum + Number(paymentApp.amount_applied),
        0
      )

      return sum + paid
    }, 0)

    // Calculate growth
    let growth = 0

    if (period === 'This Month') {
      // For monthly comparison, compare with average monthly payment of previous period
      const monthsInPreviousPeriod = 3 // Compare with last 3 months
      const averageMonthlyPayment = monthsInPreviousPeriod > 0 ? previousPeriodPaid / monthsInPreviousPeriod : 0

      growth = processedInvoices.reduce((sum, invoice) => sum + invoice.totalPaid, 0) - averageMonthlyPayment
    } else if (period === 'This Year') {
      // For yearly comparison, compare with the same period in previous year
      const currentYearTotal = processedInvoices.reduce((sum, invoice) => sum + invoice.totalPaid, 0)
      const previousYearTotal = previousPeriodPaid

      // Calculate growth as a percentage
      growth =
        previousYearTotal > 0
          ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100
          : currentYearTotal > 0
            ? 100
            : 0
    } else {
      // For weekly comparison, use direct comparison
      const currentPeriodTotal = processedInvoices.reduce((sum, invoice) => sum + invoice.totalPaid, 0)

      growth = currentPeriodTotal - previousPeriodPaid
    }

    // Calculate daily/weekly/monthly breakdown
    const dateRanges: DateRange[] = []

    if (period === 'This Week') {
      // Daily breakdown for the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)

        date.setDate(date.getDate() + i)
        const nextDate = new Date(date)

        nextDate.setDate(date.getDate() + 1)
        dateRanges.push({
          start: date,
          end: nextDate,
          label: date.toLocaleDateString('en-US', { weekday: 'short' })
        })
      }
    } else if (period === 'This Month') {
      // Weekly breakdown for the month
      const weeksInMonth = Math.ceil((endDate.getDate() - startDate.getDate() + 1) / 7)

      for (let i = 0; i < weeksInMonth; i++) {
        const weekStart = new Date(startDate)

        weekStart.setDate(startDate.getDate() + i * 7)
        const weekEnd = new Date(weekStart)

        weekEnd.setDate(weekStart.getDate() + 7)
        dateRanges.push({
          start: weekStart,
          end: weekEnd,
          label: `Week ${i + 1}`
        })
      }
    } else {
      // Monthly breakdown for the year
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(startDate.getFullYear(), i, 1)
        const monthEnd = new Date(startDate.getFullYear(), i + 1, 0)

        dateRanges.push({
          start: monthStart,
          end: monthEnd,
          label: monthStart.toLocaleDateString('en-US', { month: 'short' })
        })
      }
    }

    const breakdown = await Promise.all(
      dateRanges.map(async ({ start, end, label }) => {
        const periodInvoices = await prisma.invoice.findMany({
          where: {
            organisation_id: organisationId,
            record_status: 'ACTIVE',
            invoice_date: {
              gte: start,
              lte: end
            }
          },
          include: {
            payment_apps: {
              select: {
                id: true,
                amount_applied: true,
                payment: {
                  select: {
                    id: true,
                    payment_date: true,
                    payment_method: true
                  }
                }
              }
            }
          }
        })

        const totalPaid = periodInvoices.reduce((sum, invoice) => {
          const paid = invoice.payment_apps.reduce(
            (paymentSum, paymentApp) => paymentSum + Number(paymentApp.amount_applied),
            0
          )

          return sum + paid
        }, 0)

        return {
          period: label,
          totalPaid
        }
      })
    )

    return {
      totalRevenue: processedInvoices.reduce((sum, invoice) => sum + invoice.totalPaid, 0),
      growth,
      breakdown,
      invoices: processedInvoices,
      period,
      comparisonType: period === 'This Month' ? 'average_monthly' : 'previous_period'
    }
  } catch (error) {
    console.error('Error in getMonthlyRevenueData:', error)
    throw new Error('Failed to fetch monthly revenue data')
  }
}

type PaymentBreakdown = {
  period: string
  totalPaid: number
  date: Date
}

type PaymentTrendsData = {
  breakdown: PaymentBreakdown[]
  totalPaid: number
  growth: number
  period: Period
  comparisonType: ComparisonType
}

export const getPaymentTrendsData = async (
  organisationId: number,
  period: Period,
  filter: FilterType = 'monthly'
): Promise<PaymentTrendsData> => {
  try {
    const now = new Date()
    let startDate: Date
    const endDate: Date = now
    let previousStartDate: Date
    let previousEndDate: Date
    const breakdown: PaymentBreakdown[] = []

    // Calculate start date based on period
    switch (period) {
      case 'This Week':
        // Start of current week (Sunday)
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)

        // Previous week for comparison
        previousStartDate = new Date(startDate)
        previousStartDate.setDate(startDate.getDate() - 7)
        previousEndDate = new Date(startDate)
        previousEndDate.setDate(startDate.getDate() - 1)
        break

      case 'This Month':
        // Start of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)

        // For monthly comparison, get all previous months of the current year
        previousStartDate = new Date(now.getFullYear(), 0, 1)
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break

      case 'This Year':
        // Start of current year
        startDate = new Date(now.getFullYear(), 0, 1)

        // Previous year for comparison
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
        break

      default:
        throw new Error('Invalid period type')
    }

    // Get data based on period and filter
    switch (period) {
      case 'This Week':
        // For weekly period, always show daily breakdown
        for (let i = 0; i < 7; i++) {
          const dayStart = new Date(startDate)

          dayStart.setDate(startDate.getDate() + i)
          const dayEnd = new Date(dayStart)

          dayEnd.setHours(23, 59, 59, 999)

          const dayPayments = await prisma.payment.findMany({
            where: {
              organisation_id: organisationId,
              payment_date: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          })

          const totalPaid = dayPayments.reduce((sum, payment) => sum + Number(payment.amount_applied), 0)

          breakdown.push({
            period: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
            totalPaid,
            date: dayStart
          })
        }

        break

      case 'This Month':
        if (filter === 'daily') {
          // Show daily breakdown for the month
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

          for (let i = 0; i < daysInMonth; i++) {
            const dayStart = new Date(startDate)

            dayStart.setDate(startDate.getDate() + i)
            const dayEnd = new Date(dayStart)

            dayEnd.setHours(23, 59, 59, 999)

            const dayPayments = await prisma.payment.findMany({
              where: {
                organisation_id: organisationId,
                payment_date: {
                  gte: dayStart,
                  lte: dayEnd
                }
              }
            })

            const totalPaid = dayPayments.reduce((sum, payment) => sum + Number(payment.amount_applied), 0)

            breakdown.push({
              period: dayStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
              totalPaid,
              date: dayStart
            })
          }
        } else {
          // Show weekly breakdown for the month
          const weeksInMonth = Math.ceil((now.getDate() + startDate.getDay()) / 7)

          for (let i = 0; i < weeksInMonth; i++) {
            const weekStart = new Date(startDate)

            weekStart.setDate(startDate.getDate() + i * 7)
            const weekEnd = new Date(weekStart)

            weekEnd.setDate(weekStart.getDate() + 6)
            weekEnd.setHours(23, 59, 59, 999)

            const weekPayments = await prisma.payment.findMany({
              where: {
                organisation_id: organisationId,
                payment_date: {
                  gte: weekStart,
                  lte: weekEnd
                }
              }
            })

            const totalPaid = weekPayments.reduce((sum, payment) => sum + Number(payment.amount_applied), 0)

            breakdown.push({
              period: `Week ${i + 1}`,
              totalPaid,
              date: weekStart
            })
          }
        }

        break

      case 'This Year':
        if (filter === 'daily') {
          // Show daily breakdown for the current month
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

          for (let i = 0; i < daysInMonth; i++) {
            const dayStart = new Date(monthStart)

            dayStart.setDate(monthStart.getDate() + i)
            const dayEnd = new Date(dayStart)

            dayEnd.setHours(23, 59, 59, 999)

            const dayPayments = await prisma.payment.findMany({
              where: {
                organisation_id: organisationId,
                payment_date: {
                  gte: dayStart,
                  lte: dayEnd
                }
              }
            })

            const totalPaid = dayPayments.reduce((sum, payment) => sum + Number(payment.amount_applied), 0)

            breakdown.push({
              period: dayStart.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
              totalPaid,
              date: dayStart
            })
          }
        } else if (filter === 'weekly') {
          // Show weekly breakdown for the current month
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const weeksInMonth = Math.ceil((now.getDate() + monthStart.getDay()) / 7)

          for (let i = 0; i < weeksInMonth; i++) {
            const weekStart = new Date(monthStart)

            weekStart.setDate(monthStart.getDate() + i * 7)
            const weekEnd = new Date(weekStart)

            weekEnd.setDate(weekStart.getDate() + 6)
            weekEnd.setHours(23, 59, 59, 999)

            const weekPayments = await prisma.payment.findMany({
              where: {
                organisation_id: organisationId,
                payment_date: {
                  gte: weekStart,
                  lte: weekEnd
                }
              }
            })

            const totalPaid = weekPayments.reduce((sum, payment) => sum + Number(payment.amount_applied), 0)

            breakdown.push({
              period: `Week ${i + 1}`,
              totalPaid,
              date: weekStart
            })
          }
        } else {
          // Show monthly breakdown for the year
          for (let i = 0; i <= now.getMonth(); i++) {
            const monthStart = new Date(now.getFullYear(), i, 1)
            const monthEnd = new Date(now.getFullYear(), i + 1, 0)

            monthEnd.setHours(23, 59, 59, 999)

            const monthPayments = await prisma.payment.findMany({
              where: {
                organisation_id: organisationId,
                payment_date: {
                  gte: monthStart,
                  lte: monthEnd
                }
              }
            })

            const totalPaid = monthPayments.reduce((sum, payment) => sum + Number(payment.amount_applied), 0)

            breakdown.push({
              period: monthStart.toLocaleDateString('en-US', { month: 'short' }),
              totalPaid,
              date: monthStart
            })
          }
        }

        break
    }

    // Get previous period payments for comparison
    const previousPeriodPayments = await prisma.payment.findMany({
      where: {
        organisation_id: organisationId,
        payment_date: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      }
    })

    const previousPeriodPaid = previousPeriodPayments.reduce((sum, payment) => sum + Number(payment.amount_applied), 0)
    const totalPaid = breakdown.reduce((sum, item) => sum + item.totalPaid, 0)

    // Calculate growth
    let growth: number

    if (period === 'This Month') {
      // For monthly comparison, calculate average monthly payment for previous months
      const monthsInPreviousPeriod = now.getMonth()
      const averageMonthlyPayment = monthsInPreviousPeriod > 0 ? previousPeriodPaid / monthsInPreviousPeriod : 0

      growth = totalPaid - averageMonthlyPayment
    } else {
      // For weekly and yearly comparisons, use direct comparison
      growth = totalPaid - previousPeriodPaid
    }

    return {
      breakdown,
      totalPaid,
      growth,
      period,
      comparisonType: period === 'This Month' ? 'average_monthly' : 'previous_period'
    }
  } catch (error) {
    console.error('Error in getPaymentTrendsData:', error)
    throw new Error('Failed to fetch payment trends data')
  }
}

export async function getFinanceStatistics(organisationId: number) {
  try {
    // Get current year's start and end dates
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1) // January 1st of current year
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59) // December 31st of current year

    // Get all active invoices for the current year
    const invoices = await prisma.invoice.findMany({
      where: {
        organisation_id: organisationId,
        record_status: 'ACTIVE',
        invoice_date: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      include: {
        payment_apps: {
          include: {
            payment: true
          }
        }
      }
    })

    // Calculate statistics for current year
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount), 0)

    const totalPaid = invoices.reduce((sum, invoice) => {
      const paidAmount = invoice.payment_apps.reduce(
        (paymentSum, paymentApp) => paymentSum + Number(paymentApp.amount_applied),
        0
      )

      return sum + paidAmount
    }, 0)

    const totalPending = totalInvoiced - totalPaid
    const totalInvoices = invoices.length
    const totalPayments = invoices.reduce((sum, invoice) => sum + invoice.payment_apps.length, 0)

    // Calculate percentages
    const paidInvoicesPercentage = totalInvoices > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0
    const pendingInvoicesPercentage = totalInvoices > 0 ? Math.round((totalPending / totalInvoiced) * 100) : 0
    const collectionRate = totalInvoices > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      totalInvoices,
      totalPayments,
      paidInvoicesPercentage,
      pendingInvoicesPercentage,
      collectionRate
    }
  } catch (error) {
    console.error('Error in getFinanceStatistics:', error)
    throw new Error('Failed to fetch finance statistics')
  }
}
