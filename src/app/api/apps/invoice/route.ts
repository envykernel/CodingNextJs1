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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const visitId = searchParams.get('visitId')
  const id = searchParams.get('id')

  if (id) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        lines: true,
        visit: true,
        organisation: true,
        patient: true,
        payment_apps: {
          include: {
            payment: true
          }
        }
      }
    })

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    return NextResponse.json(invoice)
  }

  if (visitId) {
    // Query the database for invoice(s) with this visit_id
    const invoices = await prisma.invoice.findMany({
      where: { visit_id: Number(visitId) },
      include: { lines: true }
    })

    return NextResponse.json(invoices)
  }

  return NextResponse.json(db)
}

function generateInvoiceNumber() {
  return 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
}

export async function POST(req: NextRequest) {
  const data = await req.json()

  // data: { organisation_id, patient_id, visit_id, due_date, notes, lines: [{ service_id, quantity, description }] }
  const { organisation_id, patient_id, visit_id, due_date, lines, invoice_number } = data

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

  // Prepare invoice lines
  let total_amount = 0

  for (const line of lines) {
    const service = serviceMap[line.service_id] || { amount: 0, name: '', code: '', description: null }
    const unit_price = Number(service.amount)
    const quantity = Number(line.quantity)
    const line_total = unit_price * quantity

    total_amount += line_total
  }

  // Create invoice and lines
  const invoice = await prisma.invoice.create({
    data: {
      invoice_number: invoice_number || generateInvoiceNumber(),
      organisation: { connect: { id: organisation_id } },
      patient: { connect: { id: patient_id } },
      visit: visit_id ? { connect: { id: visit_id } } : undefined,
      due_date: due_date ? new Date(due_date) : undefined,
      payment_status: 'PENDING',
      record_status: 'ACTIVE',
      total_amount,
      lines: {
        create: lines.map((line: any) => {
          const service = serviceMap[line.service_id] || { amount: 0, name: '', code: '', description: null }
          return {
            service: { connect: { id: line.service_id } },
            service_name: service.name,
            service_code: service.code,
            service_description: service.description,
            description: line.description,
            quantity: Number(line.quantity),
            unit_price: Number(service.amount),
            line_total: Number(service.amount) * Number(line.quantity),
            organisation: { connect: { id: organisation_id } }
          }
        })
      }
    },
    include: { lines: true }
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
    throw new Error(`Invoice created but logging failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return NextResponse.json(invoice)
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const { id, organisation_id, patient_id, visit_id, due_date, lines, invoice_number } = data

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

  // Prepare invoice lines
  let total_amount = 0

  for (const line of lines) {
    const service = serviceMap[line.service_id] || { amount: 0, name: '', code: '', description: null }
    const unit_price = Number(service.amount)
    const quantity = Number(line.quantity)
    const line_total = unit_price * quantity

    total_amount += line_total
  }

  // --- NEW LOGIC: Prevent deletion of lines with payment applications ---
  // 1. Get all current invoice lines
  const existingLines = await prisma.invoice_line.findMany({
    where: { invoice_id: Number(id) },
    select: { id: true }
  })

  const existingLineIds = existingLines.map(l => l.id)

  // 2. Get the IDs of lines that should remain (from the request)
  //    (Assume that if a line has an id, it's an existing line to keep)
  const requestLineIds = lines.filter((l: any) => l.id).map((l: any) => l.id)

  // 3. Find lines that are going to be deleted
  const linesToDelete = existingLineIds.filter(lineId => !requestLineIds.includes(lineId))

  if (linesToDelete.length > 0) {
    // 4. Check if any of these lines have payment applications
    const paymentApps = await prisma.payment_application.findMany({
      where: { invoice_line_id: { in: linesToDelete } },
      select: { invoice_line_id: true }
    })

    if (paymentApps.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete invoice lines that have payments applied.',
          lines_with_payments: paymentApps.map(pa => pa.invoice_line_id)
        },
        { status: 400 }
      )
    }

    // 5. Safe to delete lines without payments
    await prisma.invoice_line.deleteMany({ where: { id: { in: linesToDelete } } })
  }

  // --- END NEW LOGIC ---

  // Update invoice and create/update lines
  // For simplicity, delete and recreate all lines that are not kept, and upsert the rest
  // (You may want to optimize this further for production)

  // Upsert (update or create) lines from the request
  for (const line of lines) {
    if (typeof line.id === 'number' && !isNaN(line.id)) {
      // Update existing line
      await prisma.invoice_line.update({
        where: { id: line.id },
        data: {
          service: { connect: { id: line.service_id } },
          service_name: serviceMap[line.service_id]?.name || '',
          service_code: serviceMap[line.service_id]?.code || '',
          service_description: serviceMap[line.service_id]?.description || null,
          description: line.description,
          quantity: Number(line.quantity),
          unit_price: Number(serviceMap[line.service_id]?.amount || 0),
          line_total: Number(serviceMap[line.service_id]?.amount || 0) * Number(line.quantity),
          organisation: { connect: { id: organisation_id } }
        }
      })
    } else {
      // Create new line
      await prisma.invoice_line.create({
        data: {
          invoice: { connect: { id: Number(id) } },
          service: { connect: { id: line.service_id } },
          service_name: serviceMap[line.service_id]?.name || '',
          service_code: serviceMap[line.service_id]?.code || '',
          service_description: serviceMap[line.service_id]?.description || null,
          description: line.description,
          quantity: Number(line.quantity),
          unit_price: Number(serviceMap[line.service_id]?.amount || 0),
          line_total: Number(serviceMap[line.service_id]?.amount || 0) * Number(line.quantity),
          organisation: { connect: { id: organisation_id } }
        }
      })
    }
  }

  // Update invoice fields
  const updatedInvoice = await prisma.invoice.update({
    where: { id: Number(id) },
    data: {
      invoice_number,
      organisation: { connect: { id: organisation_id } },
      patient: { connect: { id: patient_id } },
      visit: visit_id ? { connect: { id: visit_id } } : undefined,
      due_date: due_date ? new Date(due_date) : undefined,
      total_amount
    },
    include: {
      lines: true,
      visit: true,
      organisation: true,
      patient: true,
      payment_apps: {
        include: {
          payment: true
        }
      }
    }
  })

  return NextResponse.json(updatedInvoice)
}
