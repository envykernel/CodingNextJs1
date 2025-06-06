'use server'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/prisma/prisma'

type InvoiceWithRelations = Prisma.invoiceGetPayload<{
  include: {
    payment_apps: true
    patient: true
  }
}>

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

export const getMonthlyRevenueData = async (organisationId: number) => {
  try {
    // Fetch invoices with their payment applications and patient information
    const invoices = (await prisma.invoice.findMany({
      where: {
        organisation_id: organisationId,
        record_status: 'ACTIVE'
      },
      include: {
        payment_apps: true,
        patient: true // Include all patient fields
      },
      orderBy: {
        invoice_date: 'desc'
      }
    })) as InvoiceWithRelations[]

    // Process each invoice to calculate paid amount
    const invoiceData = invoices.map(invoice => {
      const totalPaid = invoice.payment_apps.reduce((sum: number, payment) => sum + Number(payment.amount_applied), 0)

      const totalAmount = Number(invoice.total_amount)
      const paidPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0

      // Get patient name from the linked patient record
      const patientName = invoice.patient?.name || 'Unknown Patient'

      return {
        invoiceNumber: invoice.invoice_number,
        date: invoice.invoice_date,
        totalAmount,
        paidAmount: totalPaid,
        paidPercentage,
        status: invoice.payment_status,
        patientName
      }
    })

    // Sort by date and get last 10 invoices
    const sortedInvoices = invoiceData.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

    // Calculate totals and growth
    const totalInvoiced = sortedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const totalPaid = sortedInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)

    // Calculate growth based on last two invoices
    const lastTwoInvoices = sortedInvoices.slice(0, 2)
    const lastMonthPaid = lastTwoInvoices[0]?.paidAmount || 0
    const previousMonthPaid = lastTwoInvoices[1]?.paidAmount || 0
    const growth = previousMonthPaid ? ((lastMonthPaid - previousMonthPaid) / previousMonthPaid) * 100 : 0

    return {
      invoices: sortedInvoices,
      totalInvoiced,
      totalPaid,
      growth
    }
  } catch (error) {
    console.error('Error fetching monthly revenue data:', error)
    throw new Error('Failed to fetch monthly revenue data')
  }
}
