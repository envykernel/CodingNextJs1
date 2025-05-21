// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AddCard from '@views/apps/invoice/add/AddCard'

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
}
 */
const InvoiceAdd = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AddCard />
      </Grid>
    </Grid>
  )
}

export default InvoiceAdd
