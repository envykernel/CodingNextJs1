'use client'

import React, { useEffect, useState, useCallback } from 'react'

import { Grid } from '@mui/material'

import EditCard from '@views/apps/invoice/edit/EditCard'
import EditActions from '@views/apps/invoice/edit/EditActions'

export default function InvoiceEditPage({ params }: { params: Promise<{ id: string }> }) {
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

      setInvoice(data)
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

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={9}>
        <EditCard invoice={invoice} refreshInvoice={fetchInvoice} />
      </Grid>
      <Grid item xs={12} md={3}>
        <EditActions invoice={invoice} refreshInvoice={fetchInvoice} />
      </Grid>
    </Grid>
  )
}
