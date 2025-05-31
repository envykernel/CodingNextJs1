/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
// Component Imports
import NotAuthorized from '@views/NotAuthorized'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'
import { TranslationProvider } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'

// @ts-ignore - Next.js types are not properly exported
export default async function AccessDeniedPage({
  params
}: {
  params: { lang: Locale }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Vars
  const mode = await getServerMode()
  const dictionary = (await getDictionary(params.lang)) as any

  return (
    <TranslationProvider dictionary={dictionary}>
      <NotAuthorized mode={mode} simple />
    </TranslationProvider>
  )
}
