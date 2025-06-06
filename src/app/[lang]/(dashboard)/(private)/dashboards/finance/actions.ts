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
