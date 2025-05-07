import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import VisitDetailsClient from './VisitDetailsClient'

export default async function VisitDetailsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang as any)

  return (
    <TranslationProvider dictionary={dictionary}>
      <VisitDetailsClient />
    </TranslationProvider>
  )
}
