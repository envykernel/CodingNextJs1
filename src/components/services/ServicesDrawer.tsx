'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useTheme } from '@mui/material/styles'

// Contexts
import { useTranslation } from '@/contexts/translationContext'

// Types
interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  isActive: boolean
}

interface ServicesDrawerProps {
  open: boolean
  onClose: () => void
}

const ServicesDrawer = ({ open, onClose }: ServicesDrawerProps) => {
  // States
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks
  const theme = useTheme()
  const { t } = useTranslation()

  // Fetch services on drawer open
  useEffect(() => {
    if (open) {
      fetchServices()
    }
  }, [open])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/services')

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()

      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
  }

  const handleSaveService = async (service: Service) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(service)
      })

      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      // Update local state
      setServices(prevServices => prevServices.map(s => (s.id === service.id ? service : s)))
      setEditingService(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddService = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const newService: Omit<Service, 'id'> = {
        name: '',
        description: '',
        price: 0,
        duration: 30,
        isActive: true
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newService)
      })

      if (!response.ok) {
        throw new Error('Failed to create service')
      }

      const createdService = await response.json()

      setServices(prevServices => [...prevServices, createdService])
      setEditingService(createdService)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm(t('services.confirmDelete'))) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      setServices(prevServices => prevServices.filter(s => s.id !== serviceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor='right'
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600 },
          p: theme => theme.spacing(5)
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Typography variant='h5'>{t('services.title')}</Typography>
        <IconButton onClick={onClose}>
          <i className='tabler-x' />
        </IconButton>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Button
          variant='contained'
          startIcon={<i className='tabler-plus' />}
          onClick={handleAddService}
          disabled={isSubmitting}
        >
          {t('services.addNew')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {services.map(service => (
            <Box
              key={service.id}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}
            >
              {editingService?.id === service.id ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label={t('services.name')}
                    value={editingService.name}
                    onChange={e => setEditingService(prev => prev && { ...prev, name: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={t('services.description')}
                    value={editingService.description}
                    onChange={e => setEditingService(prev => prev && { ...prev, description: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    type='number'
                    label={t('services.price')}
                    value={editingService.price}
                    onChange={e => setEditingService(prev => prev && { ...prev, price: Number(e.target.value) })}
                  />
                  <TextField
                    fullWidth
                    type='number'
                    label={t('services.duration')}
                    value={editingService.duration}
                    onChange={e => setEditingService(prev => prev && { ...prev, duration: Number(e.target.value) })}
                  />
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant='outlined' onClick={() => setEditingService(null)} disabled={isSubmitting}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant='contained'
                      onClick={() => handleSaveService(editingService)}
                      disabled={isSubmitting}
                    >
                      {t('common.save')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant='h6'>{service.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size='small' onClick={() => handleEditService(service)} disabled={isSubmitting}>
                        <i className='tabler-edit' />
                      </IconButton>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleDeleteService(service.id)}
                        disabled={isSubmitting}
                      >
                        <i className='tabler-trash' />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography color='text.secondary' sx={{ mb: 2 }}>
                    {service.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('services.price')}: {service.price}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {t('services.duration')}: {service.duration} {t('services.minutes')}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Drawer>
  )
}

export default ServicesDrawer
