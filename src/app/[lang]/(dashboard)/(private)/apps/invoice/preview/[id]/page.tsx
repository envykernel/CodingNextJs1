// Next Imports
import { redirect } from 'next/navigation'

// Component Imports
import Preview from '@views/apps/invoice/preview'

// Data Imports
import { prisma } from '@/prisma/prisma'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/invoice` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getInvoiceData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/invoice`)

  if (!res.ok) {
    throw new Error('Failed to fetch invoice data')
  }

  return res.json()
} */

const PreviewPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params

  // Fetch the invoice by ID from the database
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      invoice_number: true,
      invoice_date: true,
      created_at: true,
      total_amount: true,
      payment_status: true,
      record_status: true,
      lines: {
        select: {
          id: true,
          service_id: true,
          service_name: true,
          service_code: true,
          service_description: true,
          description: true,
          quantity: true,
          unit_price: true,
          line_total: true,
          created_at: true
        }
      },
      patient: true,
      organisation: {
        select: {
          id: true,
          name: true,
          address: true,
          phone_number: true,
          email: true,
          currency: true
        }
      },
      payment_apps: {
        include: {
          payment: {
            select: {
              id: true,
              payment_date: true,
              receipt_number: true,
              payment_method: true,
              amount: true,
              notes: true,
              transaction_id: true,
              created_at: true,
              updated_at: true
            }
          },
          invoice_line: {
            select: {
              id: true,
              service_id: true,
              service_name: true,
              service_code: true,
              service_description: true,
              description: true,
              quantity: true,
              unit_price: true,
              line_total: true
            }
          }
        }
      }
    }
  })

  if (!invoice) {
    redirect('/not-found')
  }

  // Convert Decimal values to numbers for client component
  const serializedInvoice = {
    ...invoice,
    total_amount: Number(invoice.total_amount),
    lines: invoice.lines.map(line => ({
      ...line,
      unit_price: Number(line.unit_price),
      line_total: Number(line.line_total),
      service: {
        id: line.service_id,
        name: line.service_name,
        code: line.service_code,
        description: line.service_description
      }
    })),
    payment_apps: invoice.payment_apps.map(app => ({
      ...app,
      amount_applied: Number(app.amount_applied),
      payment: app.payment
        ? {
            ...app.payment,
            amount: Number(app.payment.amount)
          }
        : null,
      invoice_line: app.invoice_line
        ? {
            ...app.invoice_line,
            unit_price: Number(app.invoice_line.unit_price),
            line_total: Number(app.invoice_line.line_total),
            service: {
              id: app.invoice_line.service_id,
              name: app.invoice_line.service_name,
              code: app.invoice_line.service_code,
              description: app.invoice_line.service_description
            }
          }
        : null
    }))
  }

  return <Preview invoiceData={serializedInvoice} id={id} />
}

export default PreviewPage
