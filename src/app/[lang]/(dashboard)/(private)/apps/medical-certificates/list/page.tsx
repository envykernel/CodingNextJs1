// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'

interface SearchParams {
  page?: string | string[]
  pageSize?: string | string[]
  filter?: string | string[]
  status?: string | string[]
  type?: string | string[]
  startDate?: string | string[]
  endDate?: string | string[]
}

const MedicalCertificatesListApp = async ({
  params,
  searchParams
}: {
  params: Promise<{ lang: Locale }>
  searchParams: Promise<SearchParams>
}) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <div>{/* Empty page for now */}</div>
    </TranslationProvider>
  )
}

export default MedicalCertificatesListApp
