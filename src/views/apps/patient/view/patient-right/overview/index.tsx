'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

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

// Helper for SSR-safe date formatting
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'

  return new Date(dateString).toISOString().slice(0, 10)
}

const OverViewTab = ({ patientData }: OverViewTabProps) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <div className='flex items-center gap-3 mb-4'>
              <i className='tabler-calendar-event text-xl text-primary' />
              <Typography variant='h6'>Meta Info</Typography>
            </div>
            <Divider className='mb-4' />
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar-event text-lg' />
                <Typography>
                  <b>Created At:</b> {patientData.created_at ? formatDate(patientData.created_at) : '-'}
                </Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-refresh text-lg' />
                <Typography>
                  <b>Updated At:</b> {patientData.updated_at ? formatDate(patientData.updated_at) : '-'}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default OverViewTab
