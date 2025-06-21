import type { Locale } from '@configs/i18n'
import PrintInvoiceContent from './PrintInvoiceContent'
import { getInvoice } from '@/app/server/invoiceActions'

interface PrintInvoicePageProps {
  params: {
    id: string
    lang: Locale
  }
}

export default async function PrintInvoicePage({ params }: PrintInvoicePageProps) {
  const invoiceData = await getInvoice(parseInt(params.id))

  return <PrintInvoiceContent invoiceData={invoiceData} />
}
