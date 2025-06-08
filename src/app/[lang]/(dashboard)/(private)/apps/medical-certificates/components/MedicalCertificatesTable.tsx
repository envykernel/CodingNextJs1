'use client'

import { useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  Drawer,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Card
} from '@mui/material'

import { useTranslation } from '@/contexts/translationContext'
import { LocalDate } from '@/components/LocalTime'

// Define the Certificate type
interface Certificate {
  id: number
  number: string
  patient: {
    id: number
    name: string
    birthdate: string
  }
  doctor: {
    id: number
    name: string
  }
  organisation: {
    id: number
    name: string
  }
  template: {
    code: string
    name: string
  }
  variables: Record<string, any>
  content: string
  status: string
  createdAt: string
  updatedAt: string
}

interface MedicalCertificatesTableProps {
  certificates: Certificate[]
  isLoading: boolean
  onRefresh: () => void
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

interface ViewCertificateDrawerProps {
  open: boolean
  onClose: () => void
  certificate: Certificate | null
}

const ViewCertificateDrawer: React.FC<ViewCertificateDrawerProps> = ({ open, onClose, certificate }) => {
  const { t } = useTranslation()

  if (!certificate) return null

  const variables = certificate.variables as any

  // Process the template content with actual values
  const getFilledContent = (content: string, variables: any, patient: any) => {
    let filledContent = content

    // Get the doctor and organization info from the certificate
    const doctor = certificate.doctor
    const organisation = certificate.organisation

    // Replace template variables with actual values
    const replacements: Record<string, string> = {
      '{{patient.name}}': patient.name,
      '{{patient.birthdate}}': patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : '',
      '{{doctor.name}}': doctor ? `Dr. ${doctor.name}` : 'Dr. [Doctor Name]',
      '{{organisation.name}}': organisation ? organisation.name : '[Organization Name]',
      '{{date}}': new Date().toLocaleDateString(),
      '{{medicalObservation}}': variables.notes || '',
      '{{startDate}}': variables.startDate ? new Date(variables.startDate).toLocaleDateString() : '',
      '{{endDate}}': variables.endDate ? new Date(variables.endDate).toLocaleDateString() : '',
      '{{sport}}': variables.sport || '',
      '{{restrictions}}': variables.restrictions || '',
      '{{duration}}': variables.duration || '',
      '{{reason}}': variables.reason || '',
      '{{validUntil}}': variables.validUntil ? new Date(variables.validUntil).toLocaleDateString() : '',
      '{{profession}}': variables.profession || '',
      '{{diagnosis}}': variables.diagnosis || '',
      '{{exoneration}}': variables.exoneration === 'oui' ? 'Oui' : 'Non',
      '{{school}}': variables.school || '',
      '{{inaptitude}}': variables.inaptitude || '',
      '{{observations}}': variables.observations || '',
      '{{ald}}': variables.ald === 'oui' ? 'Oui' : variables.ald === 'non' ? 'Non' : 'En cours',
      '{{treatment}}': variables.treatment || '',
      '{{recommendations}}': variables.recommendations || '',
      '{{nextAppointment}}': variables.nextAppointment ? new Date(variables.nextAppointment).toLocaleDateString() : '',
      '{{recipient.name}}': variables.recipient?.name || '',
      '{{recipient.specialty}}': variables.recipient?.specialty || '',
      '{{consultationReason}}': variables.consultationReason || '',
      '{{testsDone}}': variables.testsDone || '',
      '{{diagnosticHypothesis}}': variables.diagnosticHypothesis || '',
      '{{specificQuestions}}': variables.specificQuestions || '',
      '{{deathDate}}': variables.deathDate ? new Date(variables.deathDate).toLocaleDateString() : '',
      '{{deathTime}}': variables.deathTime || '',
      '{{deathPlace}}': variables.deathPlace || '',
      '{{apparentCause}}': variables.apparentCause || '',
      '{{circumstances}}': variables.circumstances || '',
      '{{suspiciousSigns}}': variables.suspiciousSigns || 'aucun',
      '{{vaccineName}}': variables.vaccineName || '',
      '{{lotNumber}}': variables.lotNumber || '',
      '{{administrationDate}}': variables.administrationDate
        ? new Date(variables.administrationDate).toLocaleDateString()
        : '',
      '{{doseNumber}}': variables.doseNumber || '',
      '{{schedule}}': variables.schedule || '',
      '{{nextDoseDate}}': variables.nextDoseDate ? new Date(variables.nextDoseDate).toLocaleDateString() : '',
      '{{sideEffects}}': variables.sideEffects || 'aucun'
    }

    // Replace all variables in the content
    Object.entries(replacements).forEach(([key, value]) => {
      filledContent = filledContent.replace(new RegExp(key, 'g'), value)
    })

    return filledContent
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor='right'
      PaperProps={{
        sx: { width: { xs: '100%', sm: 720 } }
      }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
          <Typography variant='h5'>{t('medicalCertificates.viewCertificate')}</Typography>
          <Button variant='outlined' onClick={onClose}>
            {t('medicalCertificates.close')}
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            {t('medicalCertificates.certificateNumber')}
          </Typography>
          <Typography variant='body1' gutterBottom>
            {certificate.number}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            {t('medicalCertificates.content')}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6
            }}
          >
            {getFilledContent(certificate.content, variables, certificate.patient)}
          </Paper>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant='outlined' onClick={onClose}>
            {t('medicalCertificates.close')}
          </Button>
          <Button
            variant='contained'
            onClick={() => window.open(`/api/certificates/${certificate.id}/download`, '_blank')}
            startIcon={<i className='tabler-download' />}
          >
            {t('medicalCertificates.actions.download')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export function MedicalCertificatesTable({ certificates, isLoading, onRefresh, error }: MedicalCertificatesTableProps) {
  const { t } = useTranslation()
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsViewDrawerOpen(true)
  }

  const handleDeleteClick = (certificate: Certificate) => {
    setCertificateToDelete(certificate)
    setIsDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!certificateToDelete) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      const response = await fetch(`/api/certificates/${certificateToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()

        throw new Error(data.error || t('deleteFailed'))
      }

      // Call the refresh function to update the parent component's state
      onRefresh()

      // Close the dialog and reset state
      setIsDeleteDialogOpen(false)
      setCertificateToDelete(null)
    } catch (error) {
      console.error('Error deleting certificate:', error)
      setDeleteError(error instanceof Error ? error.message : t('deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setCertificateToDelete(null)
    setDeleteError(null)
  }

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
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

  const getDeleteMessage = () => {
    if (!certificateToDelete) return ''

    return t('medicalCertificates.deleteConfirmation.message').replace('{number}', certificateToDelete.number)
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        <Typography variant='body2'>{t(error.message)}</Typography>
        {error.details && (
          <Typography variant='caption' sx={{ display: 'block', mt: 1 }}>
            {error.details}
          </Typography>
        )}
      </Alert>
    )
  }

  return (
    <>
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
              {certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    {t('medicalCertificates.list.noCertificates')}
                  </TableCell>
                </TableRow>
              ) : (
                certificates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(certificate => {
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
                          onClick={() => handleViewCertificate(certificate)}
                          title={t('medicalCertificates.actions.view')}
                        >
                          <i className='tabler-eye' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteClick(certificate)}
                          disabled={isDeleting}
                        >
                          <i className='tabler-trash' />
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
        count={certificates.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
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

      <ViewCertificateDrawer
        open={isViewDrawerOpen}
        onClose={() => {
          setIsViewDrawerOpen(false)
          setSelectedCertificate(null)
        }}
        certificate={selectedCertificate}
      />

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>{t('medicalCertificates.deleteConfirmation.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>{getDeleteMessage()}</DialogContentText>
          {deleteError && (
            <Typography color='error' sx={{ mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            {t('medicalCertificates.deleteConfirmation.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <i className='tabler-trash' />}
          >
            {t('medicalCertificates.deleteConfirmation.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MedicalCertificatesTable
