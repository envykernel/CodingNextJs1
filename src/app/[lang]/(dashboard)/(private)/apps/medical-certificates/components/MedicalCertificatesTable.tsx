'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation'

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  CircularProgress,
  Box,
  Alert,
  Typography,
  Chip
} from '@mui/material'

import { useTranslation } from '@/contexts/translationContext'
import type { Locale } from '@configs/i18n'
import { LocalDate } from '@/components/LocalTime'

interface MedicalCertificatesTableProps {
  certificatesData: any[]
  page: number
  pageSize: number
  total: number
  error?: {
    error: string
    message: string
    details?: string
  }
}

const statusColor: { [key: string]: string } = {
  active: 'success',
  expired: 'error',
  revoked: 'error',
  pending: 'warning'
}

const MedicalCertificatesTable: React.FC<MedicalCertificatesTableProps> = ({
  certificatesData,
  page,
  pageSize,
  total,
  error
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang as Locale
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  // Add error state
  const [errorState, setErrorState] = useState<{
    error: string
    message: string
    details?: string
  } | null>(error || null)

  // Add effect to reset loading state when data changes
  useEffect(() => {
    if (certificatesData) {
      setIsLoading(false)
    }
  }, [certificatesData])

  // Helper function to handle navigation
  const handleNavigation = async (params: URLSearchParams) => {
    setIsLoading(true)

    try {
      await router.push(`${pathname}?${params.toString()}`)
      router.refresh()
    } catch (err) {
      setErrorState({
        error: 'medicalCertificates.errors.navigationFailed',
        message: 'medicalCertificates.errors.navigationFailedMessage'
      })
      setIsLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (_event: unknown, newPage: number) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    params.set('page', String(newPage + 1))
    handleNavigation(params)
  }

  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    const newPageSize = Number(event.target.value)

    params.set('pageSize', String(newPageSize))
    params.set('page', '1')
    handleNavigation(params)
  }

  // Map template codes to frontend types for display
  const getCertificateType = (templateCode: string) => {
    const typeMap: Record<string, string> = {
      CERT_ARRET_TRAVAIL: 'sickLeave',
      CERT_APT_SPORT: 'fitness',
      CERT_MED_SIMPLE: 'medicalReport'
    }

    return typeMap[templateCode] || 'other'
  }

  if (errorState) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        <Typography variant='body2'>{t(errorState.message)}</Typography>
        {errorState.details && (
          <Typography variant='caption' sx={{ display: 'block', mt: 1 }}>
            {errorState.details}
          </Typography>
        )}
      </Alert>
    )
  }

  return (
    <Card>
      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('medicalCertificates.list.columns.patient')}</TableCell>
                <TableCell>{t('medicalCertificates.list.columns.type')}</TableCell>
                <TableCell>{t('medicalCertificates.list.columns.startDate')}</TableCell>
                <TableCell>{t('medicalCertificates.list.columns.endDate')}</TableCell>
                <TableCell>{t('medicalCertificates.list.columns.status')}</TableCell>
                <TableCell>{t('medicalCertificates.list.columns.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificatesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    {t('medicalCertificates.list.noCertificates')}
                  </TableCell>
                </TableRow>
              ) : (
                certificatesData.map(certificate => {
                  const variables = certificate.variables as any

                  return (
                    <TableRow key={certificate.id}>
                      <TableCell>{certificate.patient.name}</TableCell>
                      <TableCell>
                        {t(`medicalCertificates.types.${getCertificateType(certificate.template.code)}`)}
                      </TableCell>
                      <TableCell>
                        <LocalDate iso={variables.startDate} />
                      </TableCell>
                      <TableCell>
                        <LocalDate iso={variables.endDate} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`medicalCertificates.status.${certificate.status}`)}
                          color={statusColor[certificate.status] as any}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() => router.push(`/${lang}/apps/medical-certificates/${certificate.id}`)}
                          title={t('medicalCertificates.actions.view')}
                        >
                          <i className='tabler-eye' />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => window.open(`/api/certificates/${certificate.id}/download`, '_blank')}
                          title={t('medicalCertificates.actions.download')}
                        >
                          <i className='tabler-download' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <TablePagination
        component='div'
        count={total}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handlePageSizeChange}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage={t('medicalCertificates.pagination.labelRowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          t('medicalCertificates.pagination.labelDisplayedRows')
            .replace('{from}', from.toString())
            .replace('{to}', to.toString())
            .replace('{count}', count.toString())
        }
        getItemAriaLabel={type => {
          if (type === 'first') {
            return t('medicalCertificates.pagination.firstPageLabel')
          }

          if (type === 'last') {
            return t('medicalCertificates.pagination.lastPageLabel')
          }

          if (type === 'next') {
            return t('medicalCertificates.pagination.nextPageLabel')
          }

          return t('medicalCertificates.pagination.previousPageLabel')
        }}
      />
    </Card>
  )
}

export default MedicalCertificatesTable
