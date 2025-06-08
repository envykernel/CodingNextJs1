'use client'

import React, { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { Grid, Button } from '@mui/material'

import { useTranslation } from '@/contexts/translationContext'
import MedicalCertificatesTable from './MedicalCertificatesTable'
import AddCertificateDrawer from './AddCertificateDrawer'

interface MedicalCertificatesListProps {
  searchParams: {
    page?: string
    pageSize?: string
    lang?: string
  }
}

const MedicalCertificatesList: React.FC<MedicalCertificatesListProps> = ({ searchParams }) => {
  const { t } = useTranslation()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang as string
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [certificates, setCertificates] = useState<any[]>([])

  const [error, setError] = useState<{
    error: string
    message: string
    details?: string
  } | null>(null)

  // Use optional chaining and nullish coalescing for safer access to searchParams
  const page = Number(searchParams?.page ?? '1')
  const pageSize = Number(searchParams?.pageSize ?? '10')

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch('/api/certificates', {
          headers: {
            'Accept-Language': lang
          }
        })

        if (!response.ok) throw new Error('Failed to fetch certificates')
        const data = await response.json()

        setCertificates(data.certificates)
      } catch (err) {
        setError({
          error: 'medicalCertificates.errors.fetchFailed',
          message: 'medicalCertificates.errors.fetchFailedMessage'
        })
      }
    }

    if (lang) {
      fetchCertificates()
    }
  }, [page, pageSize, lang])

  const handleSuccess = async (data: {
    patientId: string
    type: string
    startDate: string
    endDate: string
    notes: string
  }) => {
    try {
      // First create the certificate
      const createResponse = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang
        },
        body: JSON.stringify({
          patientId: parseInt(data.patientId),
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes
        })
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()

        throw new Error(errorData.message || t('medicalCertificates.errors.createFailed'))
      }

      // Then refresh the certificates list
      const listResponse = await fetch('/api/certificates', {
        headers: {
          'Accept-Language': lang
        }
      })

      if (!listResponse.ok) throw new Error('Failed to fetch certificates')
      const responseData = await listResponse.json()

      setCertificates(responseData.certificates)
    } catch (err) {
      setError({
        error: 'medicalCertificates.errors.createFailed',
        message: err instanceof Error ? err.message : t('medicalCertificates.errors.createFailed')
      })
      throw err // Re-throw to let the drawer handle the error
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setIsDrawerOpen(true)}>
          {t('medicalCertificates.addCertificate')}
        </Button>
      </Grid>

      <Grid item xs={12}>
        <MedicalCertificatesTable
          certificatesData={certificates}
          page={page - 1} // Convert to 0-based index for MUI TablePagination
          pageSize={pageSize}
          total={100} // TODO: Get actual total from API
          error={error || undefined}
        />
      </Grid>

      <AddCertificateDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onSubmit={handleSuccess} />
    </Grid>
  )
}

export default MedicalCertificatesList
