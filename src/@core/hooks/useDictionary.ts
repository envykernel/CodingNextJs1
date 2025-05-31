'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import type { Dictionary } from '@/contexts/translationContext'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@configs/i18n'

const useDictionary = () => {
  const params = useParams<{ lang: string }>()
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)

  useEffect(() => {
    const loadDictionary = async () => {
      if (!params?.lang) {
        console.error('Language parameter is missing')

        return
      }

      try {
        const dict = await getDictionary(params.lang as Locale)

        setDictionary(dict)
      } catch (error) {
        console.error('Error loading dictionary:', error)
      }
    }

    loadDictionary()
  }, [params?.lang])

  return dictionary
}

export default useDictionary
