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

const PreviewPage = async (props: { params: { id: string } }) => {
  const { id } = props.params

  // Fetch the invoice by ID from the database
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(id) },
    include: {
      lines: { include: { service: true } },
      patient: true,
      organisation: true,
      payment_applications: true
    }
  })

  if (!invoice) {
    redirect('/not-found')
  }

  return <Preview invoiceData={invoice} id={id} />
}

export default PreviewPage
