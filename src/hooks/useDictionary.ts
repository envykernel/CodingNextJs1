'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'

const DEFAULT_LOCALE: Locale = 'fr'

const useDictionary = () => {
  const params = useParams()
  const [dictionary, setDictionary] = useState<any>(null)

  useEffect(() => {
    const loadDictionary = async () => {
      const lang = (params?.lang as Locale) || DEFAULT_LOCALE
      const dict = await getDictionary(lang)

      setDictionary(dict)
    }

    loadDictionary()
  }, [params?.lang])

  return dictionary
}

export default useDictionary
