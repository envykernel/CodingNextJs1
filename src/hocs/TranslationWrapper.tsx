// Next Imports
import type { headers } from 'next/headers'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import LangRedirect from '@components/LangRedirect'

// Config Imports
import { i18n } from '@configs/i18n'

// ℹ️ We've to create this array because next.js makes request with `_next` prefix for static/asset files
const invalidLangs = ['_next']

import { TranslationProvider } from '@/contexts/translationContext'
import { getDictionary } from '@/utils/getDictionary'

const TranslationWrapper = async (
  props: { headersList: Awaited<ReturnType<typeof headers>>; lang: Locale } & ChildrenType
) => {
  const doesLangExist = i18n.locales.includes(props.lang)
  const isInvalidLang = invalidLangs.includes(props.lang)

  if (!doesLangExist && !isInvalidLang) return <LangRedirect />

  const dictionary = await getDictionary(props.lang)

  return <TranslationProvider dictionary={dictionary}>{props.children}</TranslationProvider>
}

export default TranslationWrapper
