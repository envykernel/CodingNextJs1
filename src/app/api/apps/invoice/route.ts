/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import { LogActionType } from '@prisma/client'
import { logAction } from '@/libs/logger'

// Data Imports
import { db } from '@/fake-db/apps/invoice'
import { prisma } from '@/prisma/prisma'
import { getInvoice, getInvoicesByVisit, createInvoice, updateInvoice } from '@/app/server/invoiceActions'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const visitId = searchParams.get('visitId')
  const id = searchParams.get('id')

  if (id) {
    try {
      const invoice = await getInvoice(Number(id))
      return NextResponse.json(invoice)
    } catch (error) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
  }

  if (visitId) {
    try {
      // Query the database for invoice(s) with this visit_id using the action
      const invoices = await getInvoicesByVisit(Number(visitId))
      return NextResponse.json(invoices)
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }
  }

  return NextResponse.json(db)
}

function generateInvoiceNumber() {
  return 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
}

export async function POST(req: NextRequest) {
  const data = await req.json()

  // data: { organisation_id, patient_id, visit_id, due_date, notes, lines: [{ service_id, quantity, description }] }
  const { organisation_id, patient_id, visit_id, due_date, lines, invoice_number, notes } = data

  if (!Array.isArray(lines)) {
    return NextResponse.json({ error: 'Missing or invalid invoice lines' }, { status: 400 })
  }

  // Fetch all services for the lines
  const serviceIds = lines.map((line: any) => line.service_id)

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: {
      id: true,
      amount: true,
      name: true,
      code: true,
      description: true
    }
  })

  const serviceMap = Object.fromEntries(
    services.map((s: any) => [
      s.id,
      {
        amount: s.amount,
        name: s.name,
        code: s.code,
        description: s.description
      }
    ])
  )

  // Prepare invoice lines for the action
  const preparedLines = lines.map((line: any) => {
    const service = serviceMap[line.service_id] || { amount: 0, name: '', code: '', description: null }
    return {
      service_id: line.service_id,
      service_name: service.name,
      service_code: service.code,
      service_description: service.description,
      description: line.description,
      quantity: Number(line.quantity),
      unit_price: Number(service.amount)
    }
  })

  try {
    // Create invoice using the action
    const invoice = await createInvoice({
      organisation_id,
      patient_id,
      visit_id,
      invoice_number: invoice_number || generateInvoiceNumber(),
      invoice_date: new Date(),
      due_date: due_date ? new Date(due_date) : undefined,
      notes,
      lines: preparedLines
    })

    // Add logging after successful invoice creation
    try {
      await logAction({
        actionType: LogActionType.CREATE,
        entityType: 'invoice',
        entityId: invoice.id,
        description: `Created invoice ${invoice.invoice_number}`,
        metadata: {
          invoiceNumber: invoice.invoice_number
        },
        request: req
      })
    } catch (error) {
      // Log the error but don't fail the invoice creation
      console.error('Logging failed:', error)
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const { id, organisation_id, patient_id, visit_id, due_date, lines, invoice_number, notes } = data

  if (!id) {
    return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
  }

  if (!Array.isArray(lines)) {
    return NextResponse.json({ error: 'Missing or invalid invoice lines' }, { status: 400 })
  }

  // Fetch all services for the lines
  const serviceIds = lines.map((line: any) => line.service_id)

  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: {
      id: true,
      amount: true,
      name: true,
      code: true,
      description: true
    }
  })

  const serviceMap = Object.fromEntries(
    services.map((s: any) => [
      s.id,
      {
        amount: s.amount,
        name: s.name,
        code: s.code,
        description: s.description
      }
    ])
  )

  // Prepare invoice lines for the action
  const preparedLines = lines.map((line: any) => {
    const service = serviceMap[line.service_id] || { amount: 0, name: '', code: '', description: null }
    return {
      service_id: line.service_id,
      service_name: service.name,
      service_code: service.code,
      service_description: service.description,
      description: line.description,
      quantity: Number(line.quantity),
      unit_price: Number(service.amount)
    }
  })

  try {
    // Update invoice using the action
    const invoice = await updateInvoice(Number(id), {
      organisation_id,
      notes,
      due_date: due_date ? new Date(due_date) : undefined,
      lines: preparedLines
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
