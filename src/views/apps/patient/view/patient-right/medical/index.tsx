import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { useTranslation } from '@/contexts/translationContext'

// Component Imports
import EditMedicalHistoryDrawer from './EditMedicalHistoryDrawer'

interface MedicalDataTabProps {
  patientData: any
}

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const d = new Date(dateString)

  // Format: YYYY-MM-DD HH:mm
  return d.toISOString().slice(0, 16).replace('T', ' ')
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  const d = new Date(dateString)

  // Format: YYYY-MM-DD
  return d.toISOString().slice(0, 10)
}

const MedicalDataTab = ({ patientData }: MedicalDataTabProps) => {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<any>(null)
  const [history, setHistory] = useState(patientData?.patient_medical_history || [])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyToDelete, setHistoryToDelete] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const measurements = patientData?.patient_measurements || []
  const medicals = patientData?.patient_medical || []

  console.log('MedicalDataTab patientData:', patientData)

  const handleAddHistory = () => {
    if (!patientData?.id || !patientData?.organisation_id) {
      console.error('Missing required patient data:', patientData)
      return
    }
    setSelectedHistory(null)
    setDrawerOpen(true)
  }

  const handleEditHistory = (historyItem: any) => {
    if (!patientData?.id || !patientData?.organisation_id) {
      console.error('Missing required patient data:', patientData)
      return
    }
    console.log('Editing history item:', historyItem)
    setSelectedHistory(historyItem)
    setDrawerOpen(true)
  }

  const handleHistoryUpdated = async () => {
    try {
      if (!patientData?.id) {
        console.error('Missing patient ID:', patientData)
        throw new Error('Patient ID is missing')
      }

      const patientId = Number(patientData.id)
      if (isNaN(patientId)) {
        console.error('Invalid patient ID:', patientData.id)
        throw new Error('Invalid patient ID')
      }

      console.log('Fetching medical history for patient:', patientId)
      const response = await fetch(`/api/patient-medical-history?patientId=${patientId}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch medical history')
      }

      const data = await response.json()
      console.log('Received medical history data:', data)
      setHistory(data)
    } catch (error) {
      console.error('Error in handleHistoryUpdated:', error)
      // You might want to show an error message to the user here
    }
  }

  const handleDeleteClick = (historyItem: any) => {
    setHistoryToDelete(historyItem)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!historyToDelete?.id) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/patient-medical-history/${historyToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete medical history')
      }

      // Refresh the history list
      await handleHistoryUpdated()
      setDeleteDialogOpen(false)
      setHistoryToDelete(null)
    } catch (error) {
      console.error('Error deleting medical history:', error)
      // You might want to show an error message to the user here
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setHistoryToDelete(null)
  }

  // Add a function to get the translated history type
  const getTranslatedHistoryType = (type: string) => {
    return t(`medicalHistory.types.${type.toLowerCase().replace(' ', '_')}`) || type
  }

  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-heartbeat text-xl text-primary' />
            <Typography variant='h6'>Measurements</Typography>
          </div>
          <Divider className='mb-4' />
          {measurements.length === 0 ? (
            <Typography>No measurements available.</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left p-2'>Date</th>
                    <th className='text-left p-2'>Weight (kg)</th>
                    <th className='text-left p-2'>Height (cm)</th>
                    <th className='text-left p-2'>Temperature (°C)</th>
                    <th className='text-left p-2'>BP Systolic</th>
                    <th className='text-left p-2'>BP Diastolic</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m: any) => (
                    <tr key={m.id}>
                      <td className='p-2'>{formatDateTime(m.measured_at)}</td>
                      <td className='p-2'>{m.weight_kg ?? '-'}</td>
                      <td className='p-2'>{m.height_cm ?? '-'}</td>
                      <td className='p-2'>{m.temperature_c ?? '-'}</td>
                      <td className='p-2'>{m.blood_pressure_systolic ?? '-'}</td>
                      <td className='p-2'>{m.blood_pressure_diastolic ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <i className='tabler-notes text-xl text-primary' />
              <Typography variant='h6'>Medical History</Typography>
            </div>
            <Button variant='contained' startIcon={<i className='tabler-plus text-xl' />} onClick={handleAddHistory}>
              {t('medicalHistory.addMedicalHistory') || 'Add Medical History'}
            </Button>
          </div>
          <Divider className='mb-4' />
          {history.length === 0 ? (
            <Typography>{t('medicalHistory.noData')}</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left p-2'>{t('medicalHistory.type')}</th>
                    <th className='text-left p-2'>{t('medicalHistory.description')}</th>
                    <th className='text-left p-2'>{t('medicalHistory.dateOccurred')}</th>
                    <th className='text-left p-2'>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h: any) => (
                    <tr key={h.id}>
                      <td className='p-2'>{getTranslatedHistoryType(h.history_type) || '-'}</td>
                      <td className='p-2'>{h.description}</td>
                      <td className='p-2'>{formatDate(h.date_occurred)}</td>
                      <td className='p-2'>
                        <div className='flex gap-2'>
                          <Button
                            variant='outlined'
                            size='small'
                            onClick={() => handleEditHistory(h)}
                            startIcon={<i className='tabler-edit text-xl' />}
                          >
                            {t('medicalHistory.actions.edit')}
                          </Button>
                          <Button
                            variant='outlined'
                            color='error'
                            size='small'
                            onClick={() => handleDeleteClick(h)}
                            startIcon={<i className='tabler-trash text-xl' />}
                          >
                            {t('medicalHistory.actions.delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className='flex items-center gap-3 mb-4'>
            <i className='tabler-medical-cross text-xl text-primary' />
            <Typography variant='h6'>Other Medical Info</Typography>
          </div>
          <Divider className='mb-4' />
          {medicals.length === 0 ? (
            <Typography>No additional medical info available.</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left p-2'>Record ID</th>
                    {/* Add more headers here if there are more fields */}
                  </tr>
                </thead>
                <tbody>
                  {medicals.map((m: any) => (
                    <tr key={m.id}>
                      <td className='p-2'>{m.id}</td>
                      {/* Add more cells here if there are more fields */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} aria-labelledby='delete-dialog-title'>
        <DialogTitle id='delete-dialog-title'>{t('medicalHistory.actions.confirmDelete')}</DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
            disabled={deleteLoading}
            startIcon={deleteLoading ? <i className='tabler-loader-2 animate-spin' /> : <i className='tabler-trash' />}
          >
            {deleteLoading ? t('deleting') : t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {patientData?.id && patientData?.organisation_id && (
        <EditMedicalHistoryDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          patientId={patientData.id}
          organisationId={patientData.organisation_id}
          onHistoryUpdated={handleHistoryUpdated}
          initialData={selectedHistory}
        />
      )}
    </div>
  )
}

export default MedicalDataTab
