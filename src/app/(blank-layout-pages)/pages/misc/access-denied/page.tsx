// Component Imports
import NotAuthorized from '@views/NotAuthorized'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'

export default async function AccessDeniedPage() {
  // Vars
  const mode = await getServerMode()
  const dictionary = (await getDictionary('fr')) as any

  return (
    <TranslationProvider dictionary={dictionary}>
      <NotAuthorized mode={mode} simple />
    </TranslationProvider>
  )
}
