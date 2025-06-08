import { Typography, Grid, Box, Divider } from '@mui/material'

import { getDictionary } from '@/utils/getDictionary'
import { prisma } from '@/prisma/prisma'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import PrintButton from './PrintButton'

interface PrintCertificatePageProps {
  params: {
    id: string
    lang: Locale
  }
}

// Format date in a consistent way for both server and client
function formatDate(date: string | Date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  // Use a consistent format regardless of locale
  return `${year}-${month}-${day}`
}

async function getCertificate(id: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { id: parseInt(id) },
    include: {
      patient: true,
      doctor: true,
      organisation: true,
      template: true
    }
  })

  if (!certificate) {
    throw new Error('Certificate not found')
  }

  return certificate
}

export default async function PrintCertificatePage({ params }: PrintCertificatePageProps) {
  const certificate = await getCertificate(params.id)
  const dictionary = await getDictionary(params.lang)
  const formattedDate = formatDate(certificate.createdAt)

  // Pre-process the content to ensure consistent HTML structure
  const processedContent = certificate.content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${line}</p>`)
    .join('')

  return (
    <div className='min-h-screen bg-white p-8 print:p-0'>
      {/* Header Space */}
      {certificate.organisation.has_pre_printed_header && (
        <div style={{ height: certificate.organisation.header_height || 200 }} />
      )}

      {/* Certificate Content */}
      <div className='max-w-3xl mx-auto'>
        <TranslationProvider dictionary={dictionary}>
          <Box
            component='div'
            className='certificate-container'
            sx={{
              minHeight: '100vh',
              width: '100%',
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              '&.certificate-container': {
                print: {
                  bgcolor: 'white',
                  minHeight: '100vh',
                  width: '100%',
                  m: 0,
                  p: 0
                }
              }
            }}
          >
            {/* A4 content area */}
            <Box
              component='div'
              className='certificate-content'
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
                '&.certificate-content': {
                  print: {
                    boxShadow: 'none',
                    borderRadius: 0,
                    m: 0,
                    p: 6
                  }
                }
              }}
            >
              <Typography variant='h4' align='center' gutterBottom>
                {certificate.template?.name || 'Medical Certificate'}
              </Typography>
              <Divider sx={{ mb: 4 }} />
              <Grid container spacing={2} className='mb-4'>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' className='font-semibold'>
                    Patient:
                  </Typography>
                  <Typography>{certificate.patient?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' className='font-semibold'>
                    Doctor:
                  </Typography>
                  <Typography>{certificate.doctor?.name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' className='font-semibold'>
                    Certificate Number:
                  </Typography>
                  <Typography>{certificate.certificateNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle1' className='font-semibold'>
                    Date:
                  </Typography>
                  <Typography>{formattedDate}</Typography>
                </Grid>
              </Grid>
              <Divider />
              <Box
                component='div'
                className='certificate-body'
                sx={{
                  mt: 4,
                  mb: 4,
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&.certificate-body p': {
                    margin: '0.5em 0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
              {/* Doctor Signature Footer */}
              <Box
                component='div'
                className='signature-container'
                sx={{
                  mt: 16,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  width: '100%',
                  '&.signature-container': {
                    print: { mt: 32 }
                  }
                }}
              >
                <Box
                  component='div'
                  className='signature-box'
                  sx={{
                    textAlign: 'right',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    minWidth: 300
                  }}
                >
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
                    Doctor Signature
                  </Typography>
                  <Box
                    component='div'
                    className='signature-line'
                    sx={{
                      borderBottom: '1px solid #9ca3af',
                      width: 256,
                      height: 40
                    }}
                  />
                  <Typography variant='body2' sx={{ mt: 2 }}>
                    {certificate.doctor?.name || '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </TranslationProvider>
      </div>

      {/* Footer Space */}
      {certificate.organisation.has_pre_printed_footer && (
        <div style={{ height: certificate.organisation.footer_height || 200 }} />
      )}

      {/* Print Button - Only visible on screen */}
      <PrintButton />
    </div>
  )
}
