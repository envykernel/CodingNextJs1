import { prisma } from '@/prisma/prisma'
import type { Locale } from '@configs/i18n'
import PrintInvoiceContent from './PrintInvoiceContent'

interface PrintInvoicePageProps {
  params: {
    id: string
    lang: Locale
  }
}

// Define a type for the converted invoice data
type ConvertedInvoice = {
  id: number
  organisation_id: number
  patient_id: number | null
  visit_id: number | null
  invoice_number: string
  invoice_date: Date
  due_date: Date | null
  payment_status: string
  record_status: string
  total_amount: number
  notes: string | null
  created_at: Date
  updated_at: Date | null
  archived_at: Date | null
  deleted_at: Date | null
  archived_by: number | null
  deleted_by: number | null
  patient: {
    name: string | null
  } | null
  organisation: {
    name: string
    address: string
    city: string
    phone_number: string
    email: string
    has_pre_printed_header: boolean
    has_pre_printed_footer: boolean
    header_height: number | null
    footer_height: number | null
  }
  lines: Array<{
    id: number
    organisation_id: number
    created_at: Date
    invoice_id: number
    service_id: number
    service_name: string
    service_code: string
    service_description: string | null
    description: string | null
    quantity: number
    unit_price: number
    line_total: number
    service: {
      id: number
      name: string
      amount: number
    }
  }>
  payment_apps: Array<{
    id: number
    organisation_id: number
    created_at: Date
    invoice_id: number
    payment_id: number
    applied_date: Date
    payment: {
      id: number
      amount: number
    }
  }>
}

async function getInvoice(id: number): Promise<ConvertedInvoice> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: {
        select: {
          name: true
        }
      },
      organisation: true,
      lines: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              amount: true
            }
          }
        }
      },
      payment_apps: {
        include: {
          payment: {
            select: {
              id: true,
              amount: true
            }
          }
        }
      }
    }
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  // Convert all Decimal values to numbers
  const convertedInvoice = {
    ...invoice,
    total_amount: Number(invoice.total_amount),
    lines: invoice.lines.map(line => ({
      ...line,
      unit_price: Number(line.unit_price),
      line_total: Number(line.line_total),
      service: {
        ...line.service,
        amount: Number(line.service.amount)
      }
    })),
    payment_apps: invoice.payment_apps.map(app => ({
      ...app,
      payment: {
        ...app.payment,
        amount: Number(app.payment.amount)
      }
    }))
  }

  return convertedInvoice as unknown as ConvertedInvoice
}

export default async function PrintInvoicePage({ params }: PrintInvoicePageProps) {
  const invoiceData = await getInvoice(parseInt(params.id))

  return <PrintInvoiceContent invoiceData={invoiceData} />
}
