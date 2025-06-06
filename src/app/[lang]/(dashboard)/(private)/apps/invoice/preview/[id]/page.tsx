'use client'

import React, { useEffect, useState, useCallback } from 'react'

// Component Imports
import Preview from '@views/apps/invoice/preview'

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

const PreviewPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params)
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoice = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/apps/invoice?id=${id}`)

      if (!res.ok) throw new Error('Failed to fetch invoice')
      const data = await res.json()

      // Convert Decimal values to numbers for client component
      const serializedInvoice = {
        ...data,
        total_amount: Number(data.total_amount),
        lines: data.lines.map((line: any) => ({
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
        payment_apps: data.payment_apps.map((app: any) => ({
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

      setInvoice(serializedInvoice)
    } catch (e: any) {
      setError(e.message || 'Error fetching invoice')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>
  if (error) return <div style={{ color: 'red', padding: 32 }}>{error}</div>
  if (!invoice) return <div>Invoice not found</div>

  return <Preview invoiceData={invoice} id={id} refreshInvoice={fetchInvoice} />
}

export default PreviewPage
