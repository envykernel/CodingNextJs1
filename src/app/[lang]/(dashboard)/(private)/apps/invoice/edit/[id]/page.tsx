import { Grid } from '@mui/material'

import EditCard from '@views/apps/invoice/edit/EditCard'
import EditActions from '@views/apps/invoice/edit/EditActions'

async function getInvoice(id: string) {
  const res = await fetch(`${process.env.API_URL}/apps/invoice?id=${id}`, { cache: 'no-store' })

  if (!res.ok) return null

  return res.json()
}

export default async function InvoiceEditPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id)

  if (!invoice) return <div>Invoice not found</div>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={9}>
        <EditCard invoice={invoice} />
      </Grid>
      <Grid item xs={12} md={3}>
        <EditActions invoice={invoice} />
      </Grid>
    </Grid>
  )
}
