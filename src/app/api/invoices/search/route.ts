import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organisationId = session.user?.organisationId ? parseInt(session.user.organisationId) : undefined

    if (!organisationId) {
      return NextResponse.json({ error: 'Organisation ID not found' }, { status: 400 })
    }

    // Get the patient IDs from the URL
    const { searchParams } = new URL(request.url)
    const patientIdsParam = searchParams.get('patientIds')

    if (!patientIdsParam) {
      return NextResponse.json({ error: 'Patient IDs are required' }, { status: 400 })
    }

    // Parse and validate patient IDs
    const patientIds = patientIdsParam
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id))

    if (patientIds.length === 0) {
      return NextResponse.json({ error: 'No valid patient IDs provided' }, { status: 400 })
    }

    // Search invoices in the database
    const invoices = await prisma.invoice.findMany({
      where: {
        organisation_id: organisationId,
        patient_id: {
          in: patientIds
        },
        record_status: 'ACTIVE' // Only show active invoices
      },
      select: {
        id: true,
        invoice_number: true,
        patient_id: true,
        patient: {
          select: {
            name: true
          }
        },
        total_amount: true,
        payment_status: true,
        record_status: true,
        invoice_date: true
      },
      take: 10, // Limit results to 10 invoices
      orderBy: {
        created_at: 'desc'
      }
    })

    // Format the response
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      patient_id: invoice.patient_id,
      patient_name: invoice.patient.name,
      total_amount: Number(invoice.total_amount),
      payment_status: invoice.payment_status,
      record_status: invoice.record_status,
      invoice_date: invoice.invoice_date
    }))

    return NextResponse.json(formattedInvoices)
  } catch (error) {
    console.error('Error in invoice search API:', error)

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
