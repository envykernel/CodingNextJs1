'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Component Imports
import PatientLabTests from '../dashboard/PatientLabTests'
import PatientMeasurementsChart from '../dashboard/PatientMeasurementsChart'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/invoice` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getInvoiceData = async () => {
  const res = await fetch(`${process.env.API_URL}/apps/invoice`)

  if (!res.ok) {
    throw new Error('Failed to fetch invoice data')
  }

  return res.json()
} */

interface OverViewTabProps {
  patientData: any
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)

  // Use ISO format (YYYY-MM-DD) for consistent server/client rendering
  return date.toISOString().split('T')[0]
}

const OverViewTab = ({ patientData }: OverViewTabProps) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PatientMeasurementsChart patientId={patientData.id} dictionary={patientData.dictionary} />
      </Grid>
      <Grid item xs={12}>
        <PatientLabTests patientId={patientData.id} dictionary={patientData.dictionary} />
      </Grid>
    </Grid>
  )
}

export default OverViewTab
