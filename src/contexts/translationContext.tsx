'use client'
import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'

// The dictionary type can be improved if you have a type for it
export const TranslationContext = createContext<any>(null)

export const TranslationProvider = ({ dictionary, children }: { dictionary: any; children: ReactNode }) => (
  <TranslationContext.Provider value={dictionary}>{children}</TranslationContext.Provider>
)

export const useTranslation = () => {
  const context = useContext(TranslationContext)

  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }

  return context
}
