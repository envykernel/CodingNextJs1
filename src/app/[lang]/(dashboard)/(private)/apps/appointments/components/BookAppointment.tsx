// BookAppointment component
'use client'

import { Box, Typography, Button } from '@mui/material'

const BookAppointment = () => (
  <Box p={3}>
    <Typography variant='h4' mb={2}>
      Book Appointment
    </Typography>
    {/* Add your booking form or logic here */}
    <Button variant='contained'>Submit</Button>
  </Box>
)

export default BookAppointment
