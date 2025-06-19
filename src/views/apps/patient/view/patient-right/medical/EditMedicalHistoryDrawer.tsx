import { useState, useEffect } from 'react'
import { useTranslation } from '@/contexts/translationContext'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'

// Icon Imports
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

interface EditMedicalHistoryDrawerProps {
  open: boolean
  onClose: () => void
  patientId: number
  organisationId: number
  onHistoryUpdated: () => void
  initialData?: {
    id?: number
    history_type?: string | null
    description?: string | null
    date_occurred?: string | null
  }
}

interface HistoryItem {
  history_type: string
  description: string
  date_occurred: string
}

const EditMedicalHistoryDrawer = ({
  open,
  onClose,
  patientId,
  organisationId,
  onHistoryUpdated,
  initialData
}: EditMedicalHistoryDrawerProps) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
    if (initialData?.id) {
      // Ensure we have the correct data types and handle null values
      return [
        {
          history_type: initialData.history_type || '',
          description: initialData.description || '',
          date_occurred: initialData.date_occurred
            ? new Date(initialData.date_occurred).toISOString().split('T')[0]
            : ''
        }
      ]
    }
    return [
      {
        history_type: '',
        description: '',
        date_occurred: ''
      }
    ]
  })

  // Update historyItems when initialData changes
  useEffect(() => {
    if (initialData?.id) {
      setHistoryItems([
        {
          history_type: initialData.history_type || '',
          description: initialData.description || '',
          date_occurred: initialData.date_occurred
            ? new Date(initialData.date_occurred).toISOString().split('T')[0]
            : ''
        }
      ])
    }
  }, [initialData])

  const historyTypes = [
    { value: 'ALLERGY', label: t('medicalHistory.types.ALLERGY') },
    { value: 'CHRONIC_DISEASE', label: t('medicalHistory.types.CHRONIC_DISEASE') },
    { value: 'SURGERY', label: t('medicalHistory.types.SURGERY') },
    { value: 'HOSPITALIZATION', label: t('medicalHistory.types.HOSPITALIZATION') },
    { value: 'FAMILY_HISTORY', label: t('medicalHistory.types.FAMILY_HISTORY') },
    { value: 'VACCINATION', label: t('medicalHistory.types.VACCINATION') },
    { value: 'OTHER', label: t('medicalHistory.types.OTHER') }
  ]

  const handleChange = (index: number, field: keyof HistoryItem) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newItems = [...historyItems]
    newItems[index] = {
      ...newItems[index],
      [field]: event.target.value
    }
    setHistoryItems(newItems)
  }

  const handleAddItem = () => {
    setHistoryItems([
      ...historyItems,
      {
        history_type: '',
        description: '',
        date_occurred: ''
      }
    ])
  }

  const handleRemoveItem = (index: number) => {
    setHistoryItems(historyItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      console.log('Submit parameters:', {
        patientId,
        organisationId,
        initialData,
        historyItems
      })

      if (!patientId || !organisationId) {
        console.error('Missing required parameters:', { patientId, organisationId })
        throw new Error('Missing required parameters: patientId or organisationId')
      }

      const validItems = historyItems.filter(item => item.description.trim() !== '')

      if (validItems.length === 0) {
        throw new Error('No valid items to save')
      }

      if (initialData?.id) {
        // Update existing record
        const updateData = {
          history_type: validItems[0].history_type,
          description: validItems[0].description,
          date_occurred: validItems[0].date_occurred || null
        }
        console.log('Updating medical history:', {
          id: initialData.id,
          data: updateData
        })

        const response = await fetch(`/api/patient-medical-history/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update medical history')
        }
      } else {
        // Create new records
        const createData = validItems.map(item => ({
          patient_id: Number(patientId),
          organisation_id: Number(organisationId),
          history_type: item.history_type,
          description: item.description,
          date_occurred: item.date_occurred || null
        }))

        console.log('Creating new medical history:', createData)

        const responses = await Promise.all(
          createData.map(data =>
            fetch('/api/patient-medical-history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            })
          )
        )

        const results = await Promise.all(
          responses.map(async response => {
            if (!response.ok) {
              const data = await response.json()
              return data.error || 'Failed to save medical history item'
            }
            return null
          })
        )

        const errorMessages = results.filter(Boolean)
        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join(', '))
        }
      }

      onHistoryUpdated()
      onClose()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      // You might want to show an error message to the user here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor='right'
      PaperProps={{
        sx: {
          width: {
            xs: '100%',
            sm: '80%',
            md: '90%'
          },
          maxWidth: '1600px'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 4,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant='h5'>
            {initialData?.id ? t('medicalHistory.editMedicalHistory') : t('medicalHistory.addMedicalHistory')}
          </Typography>
          <IconButton size='small' onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 4,
            bgcolor: 'background.default'
          }}
        >
          <Stack spacing={3}>
            {/* Column Headers */}
            <Grid
              container
              sx={{
                px: 2,
                borderBottom: 1,
                borderColor: 'divider',
                pb: 1
              }}
            >
              <Grid item xs={3}>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('medicalHistory.type')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('medicalHistory.description')}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('medicalHistory.dateOccurred')}
                </Typography>
              </Grid>
            </Grid>

            {/* Items */}
            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              {historyItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    borderBottom: index < historyItems.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Grid
                    container
                    sx={{
                      p: 2,
                      alignItems: 'center'
                    }}
                  >
                    <Grid item xs={3} sx={{ pr: 2 }}>
                      <TextField
                        select
                        label={t('medicalHistory.type')}
                        value={item.history_type}
                        onChange={handleChange(index, 'history_type')}
                        fullWidth
                        size='small'
                        variant='outlined'
                      >
                        {historyTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={6} sx={{ px: 2 }}>
                      <TextField
                        label={t('medicalHistory.description')}
                        value={item.description}
                        onChange={handleChange(index, 'description')}
                        multiline
                        rows={1}
                        fullWidth
                        size='small'
                        required
                        variant='outlined'
                      />
                    </Grid>
                    <Grid item xs={3} sx={{ pl: 2, display: 'flex', alignItems: 'center' }}>
                      <TextField
                        label={t('medicalHistory.dateOccurred')}
                        type='date'
                        value={item.date_occurred}
                        onChange={handleChange(index, 'date_occurred')}
                        fullWidth
                        size='small'
                        variant='outlined'
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                      {!initialData?.id && historyItems.length > 1 && (
                        <IconButton
                          size='small'
                          onClick={() => handleRemoveItem(index)}
                          sx={{
                            ml: 1,
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.lighter'
                            }
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Paper>

            {!initialData?.id && (
              <Button
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                {t('medicalHistory.addNew')}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 4,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Stack direction='row' spacing={3} justifyContent='flex-end'>
            <Button variant='outlined' onClick={onClose} sx={{ px: 4 }}>
              {t('cancel')}
            </Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={loading || historyItems.every(item => !item.description.trim())}
              sx={{ px: 4 }}
            >
              {loading ? t('saving') : t('save')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  )
}

export default EditMedicalHistoryDrawer
