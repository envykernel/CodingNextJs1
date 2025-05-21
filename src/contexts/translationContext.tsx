'use client'
import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'

type Dictionary = {
  navigation: {
    [key: string]: string
  }
  form: {
    [key: string]: string
  }
  patient: {
    [key: string]: string
  }
  patientMeasurementsForm: {
    [key: string]: string
  }
  clinicalExamForm: {
    [key: string]: string
  }
  invoice: {
    [key: string]: string
  }
  [key: string]: {
    [key: string]: string | Dictionary
  }
}

type TranslationContextType = {
  t: (key: string) => string
  dictionary: Dictionary
}

export const TranslationContext = createContext<TranslationContextType | null>(null)

export const TranslationProvider = ({ dictionary, children }: { dictionary: Dictionary; children: ReactNode }) => {
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = dictionary

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return the key if translation is not found
      }
    }

    return typeof value === 'string' ? value : key
  }

  return <TranslationContext.Provider value={{ t, dictionary }}>{children}</TranslationContext.Provider>
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)

  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }

  return context
}
