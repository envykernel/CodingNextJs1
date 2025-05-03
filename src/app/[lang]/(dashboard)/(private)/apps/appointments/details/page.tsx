// Component Imports
import AppointmentDetails from '../components/AppointmentDetails'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'

const AppointmentDetailsApp = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <AppointmentDetails />
    </TranslationProvider>
  )
}

export default AppointmentDetailsApp
