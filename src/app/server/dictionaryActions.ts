'use server'

import { getDictionary as getDictionaryUtil } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'

export async function getDictionary(locale: Locale) {
  return getDictionaryUtil(locale)
}
