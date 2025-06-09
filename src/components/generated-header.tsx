import { Box, Typography, Grid } from '@mui/material'
import type { organisation } from '@prisma/client'
import QRCode from 'qrcode.react'

interface GeneratedHeaderProps {
  organisation: organisation
}

export function GeneratedHeader({ organisation }: GeneratedHeaderProps) {
  if (organisation.has_pre_printed_header) {
    return null
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={8}>
          <Typography variant='h5' gutterBottom>
            {organisation.name}
          </Typography>
          <Typography variant='body1'>{organisation.address}</Typography>
          <Typography variant='body1'>{organisation.city}</Typography>
          <Typography variant='body1'>{organisation.phone_number}</Typography>
          <Typography variant='body1'>{organisation.email}</Typography>
        </Grid>
        <Grid item xs={4} sx={{ textAlign: 'right' }}>
          <QRCode
            value={`${organisation.name}\n${organisation.address}\n${organisation.city}\n${organisation.phone_number}\n${organisation.email}`}
            size={100}
            level='H'
          />
        </Grid>
      </Grid>
    </Box>
  )
}
