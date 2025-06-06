import { NextResponse } from 'next/server'

import type { PaymentMethod } from '@prisma/client'

import { prisma } from '@/libs/prisma'

type PaymentApplication = {
  id: number
  amount_applied: any
  payment: {
    id: number
    amount: any
    payment_date: Date
    payment_method: PaymentMethod
    notes: string | null
  } | null
  invoice_line: {
    id: number
    service_id: number
    service: {
      id: number
      name: string
      code: string
      description: string | null
    }
  } | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        total_amount: true,
        payment_apps: {
          select: {
            id: true,
            amount_applied: true,
            payment: {
              select: {
                id: true,
                amount: true,
                payment_date: true,
                payment_method: true,
                notes: true
              }
            },
            invoice_line: {
              select: {
                id: true,
                service_id: true,
                service: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true
                  }
                }
              }
            }
          }
        },
        organisation: {
          select: {
            id: true,
            currency: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Convert Decimal values to numbers for client component
    const serializedInvoice = {
      ...invoice,
      total_amount: Number(invoice.total_amount),
      payment_apps: invoice.payment_apps.map((app: PaymentApplication) => ({
        ...app,
        amount_applied: Number(app.amount_applied),
        payment: app.payment
          ? {
              ...app.payment,
              amount: Number(app.payment.amount)
            }
          : null
      }))
    }

    return NextResponse.json(serializedInvoice)
  } catch (error) {
    console.error('Error fetching invoice payments:', error)

    return NextResponse.json({ error: 'Failed to fetch invoice payments' }, { status: 500 })
  }
}
