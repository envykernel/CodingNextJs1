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

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentApplicationId = searchParams.get('payment_application_id')

  if (!paymentApplicationId) {
    return NextResponse.json({ success: false, error: 'Missing payment_application_id' }, { status: 400 })
  }

  try {
    // Find the payment_application to get the payment_id
    const paymentApp = await prisma.payment_application.findUnique({
      where: { id: Number(paymentApplicationId) }
    })

    if (!paymentApp) {
      return NextResponse.json({ success: false, error: 'Payment application not found' }, { status: 404 })
    }

    // Delete the payment_application
    await prisma.payment_application.delete({
      where: { id: Number(paymentApplicationId) }
    })

    // Delete the related payment
    await prisma.payment.delete({
      where: { id: paymentApp.payment_id }
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
