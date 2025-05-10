import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '../../../../prisma/prisma'

export async function POST(req: NextRequest) {
  try {
    const { organisation_id, patient_id, invoice_id, invoice_line_id, amount, payment_date, payment_method, notes } =
      await req.json()

    // Map frontend payment_method to Prisma enum
    const paymentMethodMap: Record<string, string> = {
      cash: 'CASH',
      'bank-transfer': 'BANK_TRANSFER',
      credit: 'CARD',
      debit: 'CARD',
      paypal: 'OTHER',
      insurance: 'INSURANCE',
      cheque: 'CHEQUE',
      'mobile-money': 'MOBILE_MONEY'
    }

    const mappedPaymentMethod = paymentMethodMap[payment_method] || 'OTHER'

    // 1. Create payment
    const payment = await prisma.payment.create({
      data: {
        organisation_id,
        patient_id,
        amount,
        payment_date: new Date(payment_date),
        payment_method: mappedPaymentMethod as any,
        notes,
        receipt_number: `RCPT-${Date.now()}`
      }
    })

    // 2. Create payment_application
    await prisma.payment_application.create({
      data: {
        organisation_id,
        payment_id: payment.id,
        invoice_id,
        invoice_line_id,
        amount_applied: amount,
        applied_date: new Date(payment_date)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
