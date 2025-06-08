'use client'

import { useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Drawer,
  Paper,
  CircularProgress,
  TablePagination
} from '@mui/material'

import { useTranslation } from '@/contexts/translationContext'
import type { Certificate } from '@/types/certificate'

interface MedicalCertificatesTableProps {
  certificates: Certificate[]
  isLoading?: boolean
  onDelete: (certificate: Certificate) => void
  error?: Error
}

interface ViewCertificateDrawerProps {
  open: boolean
  onClose: () => void
  certificate: Certificate | null
}

const ViewCertificateDrawer: React.FC<ViewCertificateDrawerProps> = ({ open, onClose, certificate }) => {
  const { t } = useTranslation()

  if (!certificate) return null

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
            {certificate.certificateNumber || '-'}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            {t('medicalCertificates.content')}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: 1.6,
              '& p': {
                margin: '0.5em 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }
            }}
            dangerouslySetInnerHTML={{ __html: certificate.content }}
          />
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

const MedicalCertificatesTable: React.FC<MedicalCertificatesTableProps> = ({
  certificates,
  isLoading,
  onDelete,
  error
}) => {
  const { t } = useTranslation()
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null)
  const [deleteError, setDeleteError] = useState<Error | null>(null)
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

      // Optimistically remove the deleted certificate from the table
      onDelete(certificateToDelete)

      // Close the dialog and reset state
      setIsDeleteDialogOpen(false)
      setCertificateToDelete(null)
    } catch (error) {
      console.error('Error deleting certificate:', error)
      setDeleteError(error instanceof Error ? error : new Error(t('deleteFailed')))
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

  // Extract doctor name from certificate content
  const getDoctorName = (content: string) => {
    const match = content.match(/Dr ([^,]+)/)

    return match ? match[1] : '-'
  }

  // Extract patient name from certificate content
  const getPatientName = (content: string) => {
    const match = content.match(/examiné ce jour ([^,]+)/)

    return match ? match[1] : '-'
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        <Typography variant='body2'>{t(error.message)}</Typography>
        {error instanceof Error && (
          <Typography variant='caption' sx={{ display: 'block', mt: 1 }}>
            {error.stack}
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
                <TableCell>{t('medicalCertificates.certificateNumber')}</TableCell>
                <TableCell>{t('medicalCertificates.patient')}</TableCell>
                <TableCell>{t('medicalCertificates.doctor')}</TableCell>
                <TableCell>{t('medicalCertificates.createdAt')}</TableCell>
                <TableCell>{t('medicalCertificates.updatedAt')}</TableCell>
                <TableCell align='right'>{t('medicalCertificates.actionsLabel')}</TableCell>
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
                  return (
                    <TableRow key={certificate.id}>
                      <TableCell>{certificate.certificateNumber || '-'}</TableCell>
                      <TableCell>{getPatientName(certificate.content)}</TableCell>
                      <TableCell>{getDoctorName(certificate.content)}</TableCell>
                      <TableCell>{new Date(certificate.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(certificate.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell align='right'>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => handleViewCertificate(certificate)}
                            startIcon={<i className='tabler-eye' />}
                          >
                            {t('medicalCertificates.actions.view')}
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            onClick={() => handleDeleteClick(certificate)}
                            startIcon={<i className='tabler-trash' />}
                          >
                            {t('medicalCertificates.actions.delete')}
                          </Button>
                        </Box>
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
          <DialogContentText id='delete-dialog-description'>
            {t('medicalCertificates.deleteConfirmation.message').replace(
              '{number}',
              certificateToDelete?.certificateNumber || ''
            )}
          </DialogContentText>
          {deleteError && (
            <Typography color='error' sx={{ mt: 2 }}>
              {deleteError.message}
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
