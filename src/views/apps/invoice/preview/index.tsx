'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import PreviewActions from './PreviewActions'
import PreviewCard from './PreviewCard'

const Preview = ({
  invoiceData,
  id,
  refreshInvoice
}: {
  invoiceData?: any
  id: string
  refreshInvoice?: () => void
}) => {
  // Handle Print Button Click
  const handleButtonClick = () => {
    window.print()
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 9 }}>
        <PreviewCard invoiceData={invoiceData} id={id} />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <PreviewActions
          id={id}
          invoice={invoiceData}
          refreshInvoice={refreshInvoice}
          onButtonClick={handleButtonClick}
        />
      </Grid>
    </Grid>
  )
}

export default Preview
