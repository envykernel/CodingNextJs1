import { notFound } from 'next/navigation'

import { Typography, Grid, Box, Divider, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'

import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import { prisma } from '@/prisma/prisma'

interface PrintPrescriptionPageProps {
  params: { lang: Locale; id: string }
}

export default async function PrintPrescriptionPage({ params }: PrintPrescriptionPageProps) {
  const awaitedParams = await params
  const { lang, id } = awaitedParams
  const dictionary = await getDictionary(lang)

  const prescription = await prisma.prescription.findUnique({
    where: { id: Number(id) },
    include: { lines: true, doctor: true, patient: true }
  })

  if (!prescription) return notFound()

  // Format the date on the server to avoid hydration issues
  const formattedDate = prescription.created_at ? new Date(prescription.created_at).toISOString().slice(0, 10) : '-'

  return (
    <TranslationProvider dictionary={dictionary}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          print: {
            bgcolor: 'white',
            minHeight: '100vh',
            width: '100vw',
            m: 0,
            p: 0
          }
        }}
      >
        {/* A4 content area */}
        <Box
          sx={{
            width: '794px', // A4 width at 96dpi
            bgcolor: 'white',
            boxShadow: 0,
            borderRadius: 0,
            p: { xs: 2, sm: 4, print: 6 },
            m: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            print: {
              boxShadow: 'none',
              borderRadius: 0,
              m: 0,
              p: 6
            }
          }}
        >
          <Typography variant='h4' align='center' gutterBottom>
            {dictionary?.navigation?.prescriptionDetails}
          </Typography>
          <Divider />
          <Grid container spacing={2} className='mb-4'>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle1' className='font-semibold'>
                {dictionary?.navigation?.patientName}:
              </Typography>
              <Typography>{prescription.patient?.name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle1' className='font-semibold'>
                {dictionary?.navigation?.doctor}:
              </Typography>
              <Typography>{prescription.doctor?.name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='subtitle1' className='font-semibold'>
                {dictionary?.navigation?.date}:
              </Typography>
              <Typography>{formattedDate}</Typography>
            </Grid>
          </Grid>
          <Divider />
          <Typography variant='h6' gutterBottom>
            {dictionary?.navigation?.medications}
          </Typography>
          {/* Compact medications table for print using only MUI Table components */}
          <Grid container spacing={2} className='mb-4'>
            <Grid item xs={12}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size='small' sx={{ minWidth: 650, border: '1px solid #e0e0e0' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        {dictionary?.navigation?.medication}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        {dictionary?.navigation?.dosage}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        {dictionary?.navigation?.frequency}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        {dictionary?.navigation?.duration}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        {dictionary?.navigation?.notes}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescription.lines.map((med: any, idx: number) => (
                      <TableRow key={med.id} sx={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <TableCell sx={{ border: '1px solid #e0e0e0' }}>{med.drug_name}</TableCell>
                        <TableCell sx={{ border: '1px solid #e0e0e0' }}>{med.dosage || '-'}</TableCell>
                        <TableCell sx={{ border: '1px solid #e0e0e0' }}>{med.frequency || '-'}</TableCell>
                        <TableCell sx={{ border: '1px solid #e0e0e0' }}>{med.duration || '-'}</TableCell>
                        <TableCell sx={{ border: '1px solid #e0e0e0' }}>{med.instructions || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>
          </Grid>
          {/* Global prescription note after the table */}
          {prescription.notes && (
            <>
              <Divider sx={{ mb: 4 }} />
              <Typography variant='h6' gutterBottom>
                {dictionary?.navigation?.additionalNotes}
              </Typography>
              <Typography>{prescription.notes}</Typography>
            </>
          )}
          {/* Doctor Signature Footer (not at the very bottom, to leave space for pre-printed footer) */}
          <Box
            sx={{
              mt: 16,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              width: '100%',
              print: { mt: 32 }
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
                {dictionary?.navigation?.doctorSignature || 'Doctor Signature'}
              </Typography>
              <Box sx={{ borderBottom: '1px solid #9ca3af', width: 256, height: 40 }} />
              <Typography variant='body2' sx={{ mt: 2 }}>
                {prescription.doctor?.name || ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </TranslationProvider>
  )
}
