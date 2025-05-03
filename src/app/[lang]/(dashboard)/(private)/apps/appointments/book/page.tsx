// Component Imports
import BookAppointment from '../components/BookAppointment'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'
import { TranslationProvider } from '@/contexts/translationContext'

const BookAppointmentApp = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <BookAppointment />
    </TranslationProvider>
  )
}

export default BookAppointmentApp
