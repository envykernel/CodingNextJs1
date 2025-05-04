// Component Imports
import NotAuthorized from '@views/NotAuthorized'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'

const AccessDeniedPage = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const mode = await getServerMode()
  const dictionary = await getDictionary(params.lang)

  return (
    <TranslationProvider dictionary={dictionary}>
      <NotAuthorized mode={mode} simple />
    </TranslationProvider>
  )
}

export default AccessDeniedPage
