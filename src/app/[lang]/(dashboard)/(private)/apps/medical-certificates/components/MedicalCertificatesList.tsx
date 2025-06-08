'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { useParams } from 'next/navigation'

import { Grid, Button, Box, Alert } from '@mui/material'

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

export function MedicalCertificatesList({ searchParams }: MedicalCertificatesListProps) {
  const { t } = useTranslation()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang as string
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use optional chaining and nullish coalescing for safer access to searchParams
  const page = Number(searchParams?.page ?? '1')
  const pageSize = Number(searchParams?.pageSize ?? '10')

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/certificates?page=${page}&pageSize=${pageSize}`)

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch certificates')
      }

      const data = await response.json()

      setCertificates(data.certificates || [])
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    if (lang) {
      fetchCertificates()
    }
  }, [page, pageSize, lang, fetchCertificates])

  const handleSuccess = (data: any) => {
    // Just refresh the list without showing a success message
    fetchCertificates()
  }

  const handleDelete = (certificate: any) => {
    setCertificates(prev => prev.filter(cert => cert.id !== certificate.id))
  }

  return (
    <Box>
      <Grid container spacing={6}>
        {error && (
          <Grid item xs={12}>
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box display='flex' justifyContent='flex-end' mb={2}>
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setIsDrawerOpen(true)}>
              {t('medicalCertificates.addCertificate')}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <MedicalCertificatesTable
            certificates={certificates}
            isLoading={isLoading}
            onDelete={handleDelete}
            error={error}
          />
        </Grid>
        <AddCertificateDrawer
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setError(null)
          }}
          onSuccess={handleSuccess}
        />
      </Grid>
    </Box>
  )
}

export default MedicalCertificatesList
