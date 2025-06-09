import {
  Typography,
  Divider,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box
} from '@mui/material'

import { getDictionary } from '@/utils/getDictionary'
import { prisma } from '@/prisma/prisma'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import { formatDate } from '@/utils/formatDate'
import PrintButton from './PrintButton'

interface PrintRadiologyPageProps {
  params: {
    id: string
    lang: Locale
  }
}

interface RadiologyOrderItem {
  id: number
  patient_id: number
  visit_id: number | null
  doctor_id: number | null
  exam_type_id: number
  organisation_id: number
  ordered_at: Date | null
  status: string | null
  result: string | null
  result_date: Date | null
  notes: string | null
  exam_type: {
    id: number
    name: string
    category: string | null
  }
}

interface RadiologyOrderWithGrouping {
  id: number
  patient_id: number
  visit_id: number | null
  doctor_id: number | null
  exam_type_id: number
  organisation_id: number
  ordered_at: Date | null
  status: string | null
  result: string | null
  result_date: Date | null
  notes: string | null
  patient: {
    id: number
    name: string
    birthdate: Date
    gender: string
  }
  doctor: {
    id: number
    name: string
  } | null
  organisation: {
    id: number
    name: string
    address: string | null
    city: string | null
    phone_number: string | null
    email: string | null
    has_pre_printed_header: boolean
    has_pre_printed_footer: boolean
    header_height: number | null
    footer_height: number | null
  }
  visit: {
    id: number
  } | null
  exam_type: {
    id: number
    name: string
  }
  items: RadiologyOrderItem[]
  groupedItems: Record<string, RadiologyOrderItem[]>
}

async function getRadiologyOrder(id: string) {
  // First get the current radiology order to get the visit_id
  const currentRadiologyOrder = await prisma.radiology_order.findUnique({
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
      visit: true,
      exam_type: {
        select: {
          id: true,
          name: true,
          category: true
        }
      }
    }
  })

  if (!currentRadiologyOrder) {
    throw new Error('Radiology order not found')
  }

  // If there's a visit_id, get all radiology orders for this visit
  if (currentRadiologyOrder.visit_id) {
    const allRadiologyOrders = await prisma.radiology_order.findMany({
      where: {
        visit_id: currentRadiologyOrder.visit_id,
        patient_id: currentRadiologyOrder.patient_id
      },
      include: {
        exam_type: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: [{ exam_type: { category: 'asc' } }, { ordered_at: 'asc' }]
    })

    // Group the orders by category
    const groupedOrders = allRadiologyOrders.reduce(
      (acc, order) => {
        const category = order.exam_type.category || 'Non catégorisé'

        if (!acc[category]) {
          acc[category] = []
        }

        acc[category].push(order)

        return acc
      },
      {} as Record<string, typeof allRadiologyOrders>
    )

    // Return the current order with grouped orders
    return {
      ...currentRadiologyOrder,
      items: allRadiologyOrders,
      groupedItems: groupedOrders
    }
  }

  // If no visit_id, just return the single order
  const category = currentRadiologyOrder.exam_type.category || 'Non catégorisé'

  return {
    ...currentRadiologyOrder,
    items: [currentRadiologyOrder],
    groupedItems: {
      [category]: [currentRadiologyOrder]
    }
  }
}

function GeneratedHeader({
  organisation,
  doctor
}: {
  organisation: RadiologyOrderWithGrouping['organisation']
  doctor: RadiologyOrderWithGrouping['doctor']
}) {
  return (
    <div className='w-full'>
      <div className='max-w-4xl mx-auto'>
        {/* Main header container */}
        <div className='px-8 py-6 print:px-6 print:py-4'>
          {/* Top row: Organization name */}
          <div className='flex justify-between items-start mb-3 print:mb-2'>
            <div>
              <Typography
                variant='h4'
                className='font-medium text-gray-900 tracking-tight print:text-xl font-sans'
                sx={{ fontFamily: 'inherit' }}
              >
                {organisation.name}
              </Typography>
              {doctor && (
                <Typography variant='subtitle1' className='text-gray-600 mt-1'>
                  Dr. {doctor.name}
                </Typography>
              )}
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

function GeneratedFooter({ organisation }: { organisation: RadiologyOrderWithGrouping['organisation'] }) {
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

export default async function PrintRadiologyPage({ params }: PrintRadiologyPageProps) {
  const radiologyOrder = (await getRadiologyOrder(params.id)) as RadiologyOrderWithGrouping
  const dictionary = await getDictionary(params.lang)
  const formattedDate = formatDate(radiologyOrder.ordered_at)

  return (
    <div className='min-h-screen bg-white p-8 print:p-0 print:m-0'>
      <div className='max-w-3xl mx-auto print:max-w-none print:h-[297mm] print:w-[210mm] print:mx-auto print:my-0 print:bg-white print:min-h-[297mm] flex flex-col min-h-full'>
        <TranslationProvider dictionary={dictionary}>
          {/* Header */}
          <div className='flex-none'>
            {radiologyOrder.organisation.has_pre_printed_header ? (
              <div style={{ height: radiologyOrder.organisation.header_height || 200 }} />
            ) : (
              <GeneratedHeader organisation={radiologyOrder.organisation} doctor={radiologyOrder.doctor} />
            )}
          </div>

          {/* Radiology Content */}
          <div className='flex-1 w-full bg-white p-4 print:p-2 font-sans'>
            <Typography
              variant='h4'
              align='center'
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', print: '1.25rem' },
                marginBottom: { xs: 2, print: 1 },
                fontFamily: 'inherit'
              }}
            >
              Examen Radiologique
            </Typography>
            <Divider className='mb-2 print:mb-1' />
            <Grid container spacing={1} className='mb-2 print:mb-1'>
              <Grid item xs={12} sm={6}>
                <Typography component='p' variant='subtitle1' className='font-semibold print:text-sm font-sans'>
                  Patient:
                </Typography>
                <Typography component='p' className='print:text-sm font-sans'>
                  {radiologyOrder.patient?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component='p' variant='subtitle1' className='font-semibold print:text-sm font-sans'>
                  Médecin:
                </Typography>
                <Typography component='p' className='print:text-sm font-sans'>
                  {radiologyOrder.doctor?.name || '-'}
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

            {/* Radiology Orders List */}
            <Box className='mt-6 mb-2 print:mt-8 print:mb-1'>
              {Object.entries(radiologyOrder.groupedItems).map(([category, items]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 'bold' }}>
                    {category}
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 1 }} elevation={0}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ py: 0.5, fontSize: '0.875rem', fontWeight: 'bold' }}>
                            Type d&apos;examen
                          </TableCell>
                          <TableCell sx={{ py: 0.5, fontSize: '0.875rem', fontWeight: 'bold' }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>{item.exam_type.name}</TableCell>
                            <TableCell sx={{ py: 0.5, fontSize: '0.875rem' }}>{item.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>

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
                  {radiologyOrder.doctor?.name || '-'}
                </Typography>
              </div>
            </div>
          </div>

          {/* Footer - Always at bottom */}
          <div className='flex-none mt-auto relative print:absolute print:bottom-0 print:left-0 print:right-0'>
            {radiologyOrder.organisation.has_pre_printed_footer ? (
              <div style={{ height: radiologyOrder.organisation.footer_height || 200 }} />
            ) : (
              <GeneratedFooter organisation={radiologyOrder.organisation} />
            )}
          </div>
        </TranslationProvider>
      </div>

      {/* Print Button - Only visible on screen */}
      <PrintButton radiologyOrder={radiologyOrder} />
    </div>
  )
}
