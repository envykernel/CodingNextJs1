import { Typography, Divider, Grid } from '@mui/material'

import { getDictionary } from '@/utils/getDictionary'
import { prisma } from '@/prisma/prisma'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import { formatDate } from '@/utils/formatDate'
import PrintButton from '@/app/[lang]/apps/prescriptions/print/[id]/PrintButton'

interface PrintPrescriptionPageProps {
  params: {
    id: string
    lang: Locale
  }
}

async function getPrescription(id: string) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: parseInt(id) },
    include: {
      patient: true,
      doctor: true,
      organisation: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          phone_number: true,
          email: true,
          has_pre_printed_header: true,
          has_pre_printed_footer: true,
          header_height: true,
          footer_height: true
        }
      },
      lines: true,
      visit: true
    }
  })

  if (!prescription) {
    throw new Error('Prescription not found')
  }

  return prescription
}

// Generated header component
function GeneratedHeader({ organisation }: { organisation: any }) {
  return (
    <div className='w-full'>
      <div className='max-w-4xl mx-auto'>
        {/* Main header container */}
        <div className='px-8 py-6 print:px-6 print:py-4'>
          {/* Top row: Organization name and QR code */}
          <div className='flex justify-between items-start mb-3 print:mb-2'>
            <Typography
              variant='h4'
              className='font-medium text-gray-900 tracking-tight print:text-xl font-sans'
              sx={{ fontFamily: 'inherit' }}
            >
              {organisation.name}
            </Typography>
            {/* QR Code - Apple style minimal */}
            <div className='w-[42px] h-[42px] border border-gray-200 rounded-sm flex items-center justify-center bg-white print:w-[36px] print:h-[36px] relative'>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-[80%] h-[80%] bg-[linear-gradient(45deg,transparent_45%,#000_45%,#000_55%,transparent_55%),linear-gradient(-45deg,transparent_45%,#000_45%,#000_55%,transparent_55%),linear-gradient(45deg,#000_45%,transparent_45%,transparent_55%,#000_55%),linear-gradient(-45deg,#000_45%,transparent_45%,transparent_55%,#000_55%)] bg-[length:50%_50%] bg-[position:0_0,0_100%,100%_0,100%_100%] bg-no-repeat' />
              </div>
            </div>
          </div>

          {/* Bottom row: Address and contact info */}
          <div className='grid grid-cols-2 gap-8 print:gap-6'>
            {/* Left column: Address */}
            <div className='flex flex-col'>
              <Typography
                variant='body2'
                className='text-sm text-gray-600 print:text-[0.7rem] mb-0.5 font-sans'
                sx={{ fontFamily: 'inherit' }}
              >
                {organisation.address}
              </Typography>
              <Typography
                variant='body2'
                className='text-sm text-gray-600 print:text-[0.7rem] font-sans'
                sx={{ fontFamily: 'inherit' }}
              >
                {organisation.city}
              </Typography>
            </div>

            {/* Right column: Contact info */}
            <div className='flex justify-end'>
              <div className='flex flex-col'>
                <Typography
                  variant='body2'
                  className='text-sm text-gray-600 print:text-[0.7rem] mb-0.5 font-sans'
                  sx={{ fontFamily: 'inherit' }}
                >
                  Tél: {organisation.phone_number}
                </Typography>
                <Typography
                  variant='body2'
                  className='text-sm text-gray-600 print:text-[0.7rem] font-sans'
                  sx={{ fontFamily: 'inherit' }}
                >
                  Email: {organisation.email}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generated footer component
function GeneratedFooter({ organisation }: { organisation: any }) {
  return (
    <div className='w-full p-1 border-t border-gray-200 mt-auto relative print:p-2 print:bg-white print:border-t print:border-gray-200 print:text-xs print:leading-tight'>
      <div className='grid grid-cols-2 gap-1 items-center justify-between print:max-w-full print:m-0'>
        <div className='print:pr-2'>
          <Typography
            variant='body2'
            className='text-xs font-medium mb-0.5 print:text-[0.7rem] print:font-medium print:mb-0.5'
          >
            {organisation.name}
          </Typography>
          <Typography variant='body2' className='text-xs text-gray-600 print:text-[0.7rem] print:text-gray-600'>
            {organisation.address}, {organisation.city}
          </Typography>
        </div>
        <div className='text-right print:pl-2'>
          <Typography variant='body2' className='text-xs text-gray-600 print:text-[0.7rem] print:text-gray-600'>
            Tel: {organisation.phone_number}
          </Typography>
          <Typography variant='body2' className='text-xs text-gray-600 print:text-[0.7rem] print:text-gray-600'>
            Email: {organisation.email}
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default async function PrintPrescriptionPage({ params }: PrintPrescriptionPageProps) {
  const prescription = await getPrescription(params.id)
  const dictionary = await getDictionary(params.lang)
  const formattedDate = formatDate(prescription.created_at)

  return (
    <div className='min-h-screen bg-white p-8 print:p-0 print:m-0'>
      <div className='max-w-3xl mx-auto print:max-w-none print:h-[297mm] print:w-[210mm] print:mx-auto print:my-0 print:bg-white print:min-h-[297mm] flex flex-col min-h-full'>
        <TranslationProvider dictionary={dictionary}>
          {/* Header */}
          <div className='flex-none'>
            {prescription.organisation.has_pre_printed_header ? (
              <div style={{ height: prescription.organisation.header_height || 200 }} />
            ) : (
              <GeneratedHeader organisation={prescription.organisation} />
            )}
          </div>

          {/* Prescription Content */}
          <div className='flex-1 w-full bg-white p-4 print:p-2 font-sans'>
            <Typography
              component='h4'
              variant='h4'
              align='center'
              gutterBottom
              className='print:text-xl print:mb-2 font-sans'
            >
              Prescription Médicale
            </Typography>
            <Divider className='mb-2 print:mb-1' />
            <Grid container spacing={1} className='mb-2 print:mb-1'>
              <Grid item xs={12} sm={6}>
                <Typography component='p' variant='subtitle1' className='font-semibold print:text-sm font-sans'>
                  Patient:
                </Typography>
                <Typography component='p' className='print:text-sm font-sans'>
                  {prescription.patient?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component='p' variant='subtitle1' className='font-semibold print:text-sm font-sans'>
                  Médecin:
                </Typography>
                <Typography component='p' className='print:text-sm font-sans'>
                  {prescription.doctor?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component='p' variant='subtitle1' className='font-semibold print:text-sm font-sans'>
                  Date:
                </Typography>
                <Typography component='p' className='print:text-sm font-sans'>
                  {formattedDate}
                </Typography>
              </Grid>
            </Grid>
            <Divider className='mb-2 print:mb-1' />

            {/* Medications List */}
            <div className='mt-6 mb-2 print:mt-8 print:mb-1'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='py-2 px-4 text-left font-semibold text-sm'>Médicament</th>
                    <th className='py-2 px-4 text-left font-semibold text-sm'>Dosage</th>
                    <th className='py-2 px-4 text-left font-semibold text-sm'>Fréquence</th>
                    <th className='py-2 px-4 text-left font-semibold text-sm'>Durée</th>
                    <th className='py-2 px-4 text-left font-semibold text-sm'>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.lines.map((line, index) => (
                    <tr key={index} className='border-b border-gray-100'>
                      <td className='py-2 px-4 text-sm'>{line.drug_name}</td>
                      <td className='py-2 px-4 text-sm'>{line.dosage}</td>
                      <td className='py-2 px-4 text-sm'>{line.frequency}</td>
                      <td className='py-2 px-4 text-sm'>{line.duration}</td>
                      <td className='py-2 px-4 text-sm'>{line.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className='mt-4 mb-2 print:mt-6 print:mb-1'>
                <Typography component='p' variant='subtitle1' className='font-semibold print:text-sm font-sans'>
                  Notes:
                </Typography>
                <Typography component='p' className='print:text-sm font-sans whitespace-pre-wrap'>
                  {prescription.notes}
                </Typography>
              </div>
            )}

            {/* Doctor Signature */}
            <div className='mt-4 mb-8 flex flex-row justify-end items-end w-full print:mt-2 print:mb-12'>
              <div className='text-right p-2 min-w-[300px] print:p-1 print:min-w-[250px]'>
                <Typography
                  component='p'
                  variant='subtitle1'
                  className='font-semibold mb-1 print:text-sm print:mb-0.5 font-sans'
                >
                  Signature du Médecin
                </Typography>
                <div className='border-b border-gray-400 w-64 h-10 print:w-50 print:h-8' />
                <Typography component='p' variant='body2' className='mt-1 print:text-xs print:mt-0.5 font-sans'>
                  {prescription.doctor?.name || '-'}
                </Typography>
              </div>
            </div>
          </div>

          {/* Footer - Always at bottom */}
          <div className='flex-none mt-auto relative print:absolute print:bottom-0 print:left-0 print:right-0'>
            {prescription.organisation.has_pre_printed_footer ? (
              <div style={{ height: prescription.organisation.footer_height || 200 }} />
            ) : (
              <GeneratedFooter organisation={prescription.organisation} />
            )}
          </div>
        </TranslationProvider>
      </div>

      {/* Print Button - Only visible on screen */}
      <PrintButton prescription={prescription} />
    </div>
  )
}
