'use server'

import { prisma } from '@/libs/prisma'

type Period = 'This Week' | 'This Month' | 'This Year'
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
    // Debug query to see all payment applications and their relationships
    const debugPayments = await prisma.payment_application.findMany({
      where: {
        organisation_id: organisationId
      },
      select: {
        id: true,
        amount_applied: true,
        payment_id: true,
        invoice_line_id: true,
        invoice_line: {
          select: {
            id: true,
            service_name: true,
            service_id: true,
            service: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: {
        invoice_line_id: 'asc'
      }
    })

    // Convert Decimal to number in the debug data
    const processedDebugPayments = debugPayments.map(payment => ({
      ...payment,
      amount_applied: Number(payment.amount_applied)
    }))

    console.log('Debug Payment Applications:', JSON.stringify(processedDebugPayments, null, 2))

    // Process the payments directly from debug data to ensure we're using the same data
    const revenueMap = new Map<string, number>()

    processedDebugPayments.forEach(payment => {
      if (payment.invoice_line) {
        // Use service name from the service relation if available, fallback to invoice_line service_name
        const serviceName = payment.invoice_line.service?.name || payment.invoice_line.service_name || 'Unknown Service'

        const amount = payment.amount_applied

        console.log(`Processing payment ${payment.id}: Service=${serviceName}, Amount=${amount}`)

        revenueMap.set(serviceName, (revenueMap.get(serviceName) || 0) + amount)
      }
    })

    // Convert to array and sort
    const groupedRevenues = Array.from(revenueMap.entries())
      .map(([serviceName, totalRevenue]) => {
        console.log(`Final revenue for ${serviceName}: ${totalRevenue}`)

        return {
          serviceName,
          totalRevenue
        }
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Calculate total revenue
    const total = groupedRevenues.reduce((sum, item) => sum + item.totalRevenue, 0)

    console.log('Final grouped revenues:', JSON.stringify(groupedRevenues, null, 2))

    return {
      services: groupedRevenues,
      totalRevenue: total,
      debug: {
        payments: processedDebugPayments,
        processedPayments: Array.from(revenueMap.entries()).map(([service, amount]) => ({
          service,
          amount
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching service revenue data:', error)
    throw new Error('Failed to fetch service revenue data')
  }
}

export const getMonthlyRevenueData = async (organisationId: number, period: Period) => {
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
        payment_apps: true
      },
      orderBy: {
        invoice_date: 'desc'
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
        payment_apps: true
      }
    })

    // Process current period invoices
    const processedInvoices = invoices.map(invoice => {
      const totalPaid = invoice.payment_apps.reduce((sum: number, payment) => sum + Number(payment.amount_applied), 0)
      const totalAmount = Number(invoice.total_amount)
      const paidPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

      return {
        invoiceNumber: invoice.invoice_number,
        date: invoice.invoice_date,
        totalAmount,
        paidAmount: totalPaid,
        paidPercentage: Math.min(paidPercentage, 100),
        status: invoice.payment_status,
        patientName: invoice.patient?.name || 'Unknown Patient'
      }
    })

    // Calculate totals
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount), 0)
    const totalPaid = processedInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0)

    // Calculate previous period total
    const previousPeriodPaid = previousPeriodInvoices.reduce((sum, invoice) => {
      const paid = invoice.payment_apps.reduce((paymentSum, payment) => paymentSum + Number(payment.amount_applied), 0)

      return sum + paid
    }, 0)

    // Calculate growth
    let growth: number

    if (period === 'This Month') {
      // For monthly comparison, calculate average monthly payment for previous months
      const monthsInPreviousPeriod = now.getMonth() // Number of months from start of year to current month
      const averageMonthlyPayment = monthsInPreviousPeriod > 0 ? previousPeriodPaid / monthsInPreviousPeriod : 0

      growth = totalPaid - averageMonthlyPayment
    } else {
      // For weekly and yearly comparisons, use direct comparison
      growth = totalPaid - previousPeriodPaid
    }

    return {
      invoices: processedInvoices,
      totalInvoiced,
      totalPaid,
      growth,
      previousPeriodPaid,
      period,
      comparisonType: (period === 'This Month' ? 'average_monthly' : 'previous_period') as ComparisonType
    }
  } catch (error) {
    console.error('Error in getMonthlyRevenueData:', error)
    throw new Error('Failed to fetch monthly revenue data')
  }
}
