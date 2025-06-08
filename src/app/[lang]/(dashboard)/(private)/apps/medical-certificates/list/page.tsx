'use client'

import React from 'react'

import { useTranslation } from '@/contexts/translationContext'
import MedicalCertificatesList from '../components/MedicalCertificatesList'

interface PageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
  }>
}

const Page: React.FC<PageProps> = ({ searchParams }) => {
  const { t } = useTranslation()
  const unwrappedSearchParams = React.use(searchParams)

  return (
    <div>
      <h1>{t('medicalCertificates.title')}</h1>
      <MedicalCertificatesList searchParams={unwrappedSearchParams} />
    </div>
  )
}

export default Page
