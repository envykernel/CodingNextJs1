'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'

const useDictionary = () => {
  const params = useParams()
  const [dictionary, setDictionary] = useState<any>(null)

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(params.lang as Locale)

      setDictionary(dict)
    }

    loadDictionary()
  }, [params.lang])

  return dictionary
}

export default useDictionary
