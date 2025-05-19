// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import InvoiceList from '@views/apps/invoice/list'

// Data Imports
import { getInvoiceData } from '@/app/server/actions'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import type { InvoiceType } from '@/types/apps/invoiceTypes'

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

const InvoiceApp = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  // Vars
  const resolvedParams = await params
  const data = await getInvoiceData()
  const dictionary = await getDictionary(resolvedParams.lang)

  // Transform data to match InvoiceType
  const transformedData: InvoiceType[] = data.map((invoice: any) => ({
    ...invoice,
    issuedDate: invoice.invoice_date // Map invoice_date to issuedDate
  }))

  return (
    <TranslationProvider dictionary={dictionary}>
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <InvoiceList invoiceData={transformedData} />
        </Grid>
      </Grid>
    </TranslationProvider>
  )
}

export default InvoiceApp
