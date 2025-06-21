import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getInvoicesByPatient } from '@/app/server/invoiceActions'

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

    // Get all invoices for the patient using the action
    const organisationId = session.user.organisationId ? parseInt(session.user.organisationId) : undefined

    const invoices = await getInvoicesByPatient(
      patientId,
      {
        invoice_date: 'desc'
      },
      organisationId
    )

    // Filter for active invoices only
    const activeInvoices = invoices.filter(invoice => invoice.record_status === 'ACTIVE')

    // Format the response
    const formattedInvoices = activeInvoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date.toISOString(),
      dueDate: invoice.due_date ? invoice.due_date.toISOString() : null,
      totalAmount: invoice.total_amount,
      paymentStatus: invoice.payment_status,
      recordStatus: invoice.record_status,
      notes: invoice.notes
    }))

    return NextResponse.json(formattedInvoices)
  } catch (error) {
    console.error('Error fetching patient invoices:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
