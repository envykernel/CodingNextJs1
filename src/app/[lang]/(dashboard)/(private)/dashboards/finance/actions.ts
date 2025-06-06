'use server'

import { prisma } from '@/prisma/prisma'

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
