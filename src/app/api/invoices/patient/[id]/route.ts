import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patientId = parseInt(id)

    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 })
    }

    // Get all invoices for the patient
    const invoices = await prisma.invoice.findMany({
      where: {
        patient_id: patientId,
        organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined,
        record_status: 'ACTIVE'
      },
      orderBy: {
        invoice_date: 'desc'
      }
    })

    // Format the response
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date.toISOString(),
      dueDate: invoice.due_date ? invoice.due_date.toISOString() : null,
      totalAmount: parseFloat(invoice.total_amount.toString()),
      paymentStatus: invoice.payment_status,
      recordStatus: invoice.record_status,
      notes: invoice.notes
    }))

    return NextResponse.json(formattedInvoices)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
