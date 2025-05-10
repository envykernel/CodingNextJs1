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
      include: { lines: true, visit: true, organisation: true, patient: true }
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
    select: { id: true, amount: true }
  })

  const serviceMap = Object.fromEntries(services.map((s: any) => [s.id, s.amount]))

  // Prepare invoice lines
  let total_amount = 0

  const invoiceLines = lines.map((line: any) => {
    const unit_price = Number(serviceMap[line.service_id] || 0)
    const quantity = Number(line.quantity)
    const line_total = unit_price * quantity

    total_amount += line_total

    return {
      service: { connect: { id: line.service_id } },
      description: line.description,
      quantity,
      unit_price,
      line_total,
      organisation: { connect: { id: organisation_id } }
    }
  })

  // Create invoice and lines
  const invoice = await prisma.invoice.create({
    data: {
      invoice_number: invoice_number || generateInvoiceNumber(),
      organisation: { connect: { id: organisation_id } },
      patient: { connect: { id: patient_id } },
      visit: visit_id ? { connect: { id: visit_id } } : undefined,
      due_date: due_date ? new Date(due_date) : undefined,
      total_amount,
      lines: {
        create: invoiceLines
      }
    },
    include: { lines: true }
  })

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
    select: { id: true, amount: true }
  })

  const serviceMap = Object.fromEntries(services.map((s: any) => [s.id, s.amount]))

  // Prepare invoice lines
  let total_amount = 0

  const invoiceLines = lines.map((line: any) => {
    const unit_price = Number(serviceMap[line.service_id] || 0)
    const quantity = Number(line.quantity)
    const line_total = unit_price * quantity

    total_amount += line_total

    return {
      service: { connect: { id: line.service_id } },
      description: line.description,
      quantity,
      unit_price,
      line_total,
      organisation: { connect: { id: organisation_id } }
    }
  })

  // Delete existing lines
  await prisma.invoice_line.deleteMany({ where: { invoice_id: Number(id) } })

  // Update invoice and create new lines
  const updatedInvoice = await prisma.invoice.update({
    where: { id: Number(id) },
    data: {
      invoice_number,
      organisation: { connect: { id: organisation_id } },
      patient: { connect: { id: patient_id } },
      visit: visit_id ? { connect: { id: visit_id } } : undefined,
      due_date: due_date ? new Date(due_date) : undefined,
      total_amount,
      lines: {
        create: invoiceLines
      }
    },
    include: { lines: true, visit: true }
  })

  return NextResponse.json(updatedInvoice)
}
