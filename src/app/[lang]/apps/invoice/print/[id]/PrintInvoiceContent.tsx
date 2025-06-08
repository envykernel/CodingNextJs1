'use client'

import { useParams } from 'next/navigation'

import { Divider, Grid } from '@mui/material'

import { useTranslation } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import { formatDate } from '@/utils/formatDate'
import PrintButton from './PrintButton'

type ConvertedInvoice = {
  id: number
  organisation_id: number
  patient_id: number | null
  visit_id: number | null
  invoice_number: string
  invoice_date: Date
  due_date: Date | null
  payment_status: string
  record_status: string
  total_amount: number
  notes: string | null
  created_at: Date
  updated_at: Date | null
  archived_at: Date | null
  deleted_at: Date | null
  archived_by: number | null
  deleted_by: number | null
  patient: {
    name: string | null
  } | null
  organisation: {
    name: string
    address: string
    city: string
    phone_number: string
    email: string
    has_pre_printed_header: boolean
    has_pre_printed_footer: boolean
    header_height: number | null
    footer_height: number | null
  }
  lines: Array<{
    id: number
    organisation_id: number
    created_at: Date
    invoice_id: number
    service_id: number
    service_name: string
    service_code: string
    service_description: string | null
    description: string | null
    quantity: number
    unit_price: number
    line_total: number
    service: {
      id: number
      name: string
      amount: number
    }
  }>
  payment_apps: Array<{
    id: number
    organisation_id: number
    created_at: Date
    invoice_id: number
    payment_id: number
    applied_date: Date
    payment: {
      id: number
      amount: number
    }
  }>
}

interface PrintInvoiceContentProps {
  invoiceData: ConvertedInvoice
}

export default function PrintInvoiceContent({ invoiceData }: PrintInvoiceContentProps) {
  const { t } = useTranslation()
  const params = useParams()
  const locale = (params?.lang as Locale) || 'fr'

  // Use consistent date formatting based on locale
  const formattedDate = formatDate(
    invoiceData.invoice_date,
    locale === 'ar' ? 'ar-SA' : locale === 'en' ? 'en-US' : 'fr-FR'
  )

  const formattedDueDate = formatDate(
    invoiceData.due_date,
    locale === 'ar' ? 'ar-SA' : locale === 'en' ? 'en-US' : 'fr-FR'
  )

  // Calculate totals with proper type assertions
  const subtotal = invoiceData.lines.reduce((sum: number, item) => {
    const amount = Number(item.service.amount)
    const quantity = Number(item.quantity)

    return sum + amount * quantity
  }, 0)

  const totalPaid = invoiceData.payment_apps.reduce((sum: number, app) => {
    const amount = Number(app.payment.amount)

    return sum + amount
  }, 0)

  const balance = Number(subtotal) - Number(totalPaid)

  return (
    <div className='min-h-screen bg-white p-8 print:p-0 print:m-0'>
      <div className='max-w-3xl mx-auto print:max-w-none print:h-[297mm] print:w-[210mm] print:mx-auto print:my-0 print:bg-white print:min-h-[297mm] flex flex-col min-h-full'>
        {/* Header */}
        <div className='flex-none'>
          {invoiceData.organisation.has_pre_printed_header ? (
            <div style={{ height: invoiceData.organisation.header_height || 200 }} />
          ) : (
            <div className='w-full font-sans'>
              <div className='max-w-4xl mx-auto'>
                <div className='px-8 py-6 print:px-6 print:py-4'>
                  <div className='flex justify-between items-start mb-3 print:mb-2'>
                    <div className='font-medium text-gray-900 tracking-tight print:text-xl font-sans text-2xl'>
                      {invoiceData.organisation.name}
                    </div>
                    <div className='w-[42px] h-[42px] border border-gray-200 rounded-sm flex items-center justify-center bg-white print:w-[36px] print:h-[36px] relative'>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='w-[80%] h-[80%] bg-[linear-gradient(45deg,transparent_45%,#000_45%,#000_55%,transparent_55%),linear-gradient(-45deg,transparent_45%,#000_45%,#000_55%,transparent_55%),linear-gradient(45deg,#000_45%,transparent_45%,transparent_55%,#000_55%),linear-gradient(-45deg,#000_45%,transparent_45%,transparent_55%,#000_55%)] bg-[length:50%_50%] bg-[position:0_0,0_100%,100%_0,100%_100%] bg-no-repeat' />
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4 print:gap-2'>
                    <div>
                      <div className='text-sm text-gray-600 print:text-xs font-sans'>
                        {invoiceData.organisation.address}
                      </div>
                      <div className='text-sm text-gray-600 print:text-xs font-sans'>
                        {invoiceData.organisation.city}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm text-gray-600 print:text-xs font-sans'>
                        {t('common.phone')}: {invoiceData.organisation.phone_number}
                      </div>
                      <div className='text-sm text-gray-600 print:text-xs font-sans'>
                        {t('common.email')}: {invoiceData.organisation.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Content */}
        <div className='flex-1 w-full bg-white p-4 print:p-2 font-sans'>
          <div className='text-2xl font-medium text-center mb-4 print:text-xl print:mb-2 font-sans'>
            {t('invoice.print.title')}
          </div>
          <Divider className='mb-2 print:mb-1' />
          <Grid container spacing={1} className='mb-2 print:mb-1'>
            <Grid item xs={12} sm={6}>
              <div className='text-base font-semibold print:text-sm font-sans'>{t('patient.patientName')}:</div>
              <div className='text-base print:text-sm font-sans'>{invoiceData.patient?.name || '-'}</div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className='text-base font-semibold print:text-sm font-sans'>{t('invoice.print.invoiceNumber')}:</div>
              <div className='text-base print:text-sm font-sans'>{invoiceData.invoice_number || '-'}</div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className='text-base font-semibold print:text-sm font-sans'>{t('invoice.date')}:</div>
              <div className='text-base print:text-sm font-sans'>{formattedDate}</div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className='text-base font-semibold print:text-sm font-sans'>{t('invoice.print.dueDate')}:</div>
              <div className='text-base print:text-sm font-sans'>{formattedDueDate}</div>
            </Grid>
          </Grid>
          <Divider className='mb-2 print:mb-1' />

          {/* Services Table */}
          <div className='mt-6 mb-4'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-2 px-4 font-semibold text-sm'>{t('invoice.print.service')}</th>
                  <th className='text-right py-2 px-4 font-semibold text-sm'>{t('invoice.print.quantity')}</th>
                  <th className='text-right py-2 px-4 font-semibold text-sm'>{t('invoice.print.price')}</th>
                  <th className='text-right py-2 px-4 font-semibold text-sm'>{t('invoice.print.total')}</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.lines.map((item, index) => (
                  <tr key={index} className='border-b border-gray-100'>
                    <td className='py-2 px-4 text-sm'>{item.service.name}</td>
                    <td className='py-2 px-4 text-sm text-right'>{item.quantity}</td>
                    <td className='py-2 px-4 text-sm text-right'>€{item.service.amount.toFixed(2)}</td>
                    <td className='py-2 px-4 text-sm text-right'>
                      €{(item.service.amount * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className='py-2 px-4 text-right font-semibold text-sm'>
                    {t('invoice.print.subtotal')}:
                  </td>
                  <td className='py-2 px-4 text-right font-semibold text-sm'>€{subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className='py-2 px-4 text-right font-semibold text-sm'>
                    {t('invoice.totalPaid')}:
                  </td>
                  <td className='py-2 px-4 text-right font-semibold text-sm'>€{totalPaid.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className='py-2 px-4 text-right font-semibold text-sm'>
                    {t('invoice.balance')}:
                  </td>
                  <td className='py-2 px-4 text-right font-semibold text-sm'>€{balance.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature */}
          <div className='mt-4 mb-8 flex flex-row justify-end items-end w-full print:mt-2 print:mb-12'>
            <div className='text-right p-2 min-w-[300px] print:p-1 print:min-w-[250px]'>
              <div className='text-base font-semibold mb-1 print:text-sm print:mb-0.5 font-sans'>
                {t('invoice.print.signature')}
              </div>
              <div className='border-b border-gray-400 w-64 h-10 print:w-50 print:h-8' />
            </div>
          </div>
        </div>

        {/* Footer - Always at bottom */}
        <div className='flex-none mt-auto relative print:absolute print:bottom-0 print:left-0 print:right-0'>
          {invoiceData.organisation.has_pre_printed_footer ? (
            <div style={{ height: invoiceData.organisation.footer_height || 200 }} />
          ) : (
            <div className='w-full p-1 border-t border-gray-200 mt-auto relative print:p-2 print:bg-white print:border-t print:border-gray-200 print:text-xs print:leading-tight font-sans'>
              <div className='grid grid-cols-2 gap-1 items-center justify-between print:max-w-full print:m-0'>
                <div className='print:pr-2'>
                  <div className='text-xs font-medium mb-0.5 print:text-[0.7rem] print:font-medium print:mb-0.5 font-sans'>
                    {invoiceData.organisation.name}
                  </div>
                  <div className='text-xs text-gray-600 print:text-[0.7rem] print:text-gray-600 font-sans'>
                    {invoiceData.organisation.address}, {invoiceData.organisation.city}
                  </div>
                </div>
                <div className='text-right print:pl-2'>
                  <div className='text-xs text-gray-600 print:text-[0.7rem] print:text-gray-600 font-sans'>
                    {t('common.phone')}: {invoiceData.organisation.phone_number}
                  </div>
                  <div className='text-xs text-gray-600 print:text-[0.7rem] print:text-gray-600 font-sans'>
                    {t('common.email')}: {invoiceData.organisation.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Button - Only visible on screen */}
      <PrintButton />
    </div>
  )
}
