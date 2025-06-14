'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { useParams } from 'next/navigation'

import { Grid, Button, Box, Typography, Paper } from '@mui/material'

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
  const [error, setError] = useState<Error | undefined>(undefined)

  // Use optional chaining and nullish coalescing for safer access to searchParams
  const page = Number(searchParams?.page ?? '1')
  const pageSize = Number(searchParams?.pageSize ?? '10')

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)

      console.log('Fetching certificates...')
      const response = await fetch(`/api/certificates?page=${page}&pageSize=${pageSize}`)

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()

        console.error('Error response data:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to fetch certificates')
      }

      const data = await response.json()

      console.log('Certificates data:', data)

      setCertificates(data.certificates || [])
    } catch (err) {
      console.error('Error fetching certificates:', err)

      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        })
      }

      setError(err instanceof Error ? err : new Error('An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    if (lang) {
      fetchCertificates()
    }
  }, [page, pageSize, lang, fetchCertificates])

  const handleSuccess = (newCertificate: any) => {
    // Optimistically add the new certificate to the list
    setCertificates(prevCertificates => [newCertificate, ...prevCertificates])
  }

  const handleDelete = (certificate: any) => {
    setCertificates(prev => prev.filter(cert => cert.id !== certificate.id))
  }

  return (
    <Box>
      <Grid container spacing={6}>
        {error ? (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '200px'
              }}
            >
              <Typography variant='h6' color='text.secondary' gutterBottom>
                {t('common.tryAgainLater')}
              </Typography>
            </Paper>
          </Grid>
        ) : (
          <>
            <Grid item xs={12}>
              <Box display='flex' justifyContent='flex-end' mb={2}>
                <Button
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={() => setIsDrawerOpen(true)}
                >
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
          </>
        )}
        <AddCertificateDrawer
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setError(undefined)
          }}
          onSuccess={handleSuccess}
        />
      </Grid>
    </Box>
  )
}

export default MedicalCertificatesList
