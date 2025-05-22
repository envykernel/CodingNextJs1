'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

// Third-party Imports
import { useSession } from 'next-auth/react'

import type { organisation } from '@prisma/client'

import { useTranslation } from '@/contexts/translationContext'

// Type Imports

interface EditOrganisationDrawerProps {
  open: boolean
  onClose: () => void
  onOrganisationUpdated: (organisation: organisation) => void
}

const workingDaysOptions = [
  { value: 'Monday', short: 'Mon' },
  { value: 'Tuesday', short: 'Tue' },
  { value: 'Wednesday', short: 'Wed' },
  { value: 'Thursday', short: 'Thu' },
  { value: 'Friday', short: 'Fri' },
  { value: 'Saturday', short: 'Sat' },
  { value: 'Sunday', short: 'Sun' }
]

const EditOrganisationDrawer = ({ open, onClose, onOrganisationUpdated }: EditOrganisationDrawerProps) => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { t } = useTranslation()

  const [formData, setFormData] = useState<Partial<organisation>>({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    status: 'enabled',
    working_days: [],
    work_start_time: '',
    work_end_time: '',
    break_start_time: '',
    break_end_time: ''
  })

  // Hooks
  const { data: session } = useSession()

  useEffect(() => {
    const fetchOrganisationData = async () => {
      if (!session?.user?.organisationId) return

      try {
        setLoading(true)
        const response = await fetch(`/api/organisation/${session.user.organisationId}`)

        if (!response.ok) throw new Error('Failed to fetch organisation data')

        const data = await response.json()

        // Ensure working_days is always an array
        const organisationData = {
          ...data.organisation,
          working_days: Array.isArray(data.organisation.working_days) ? data.organisation.working_days : []
        }

        setFormData(organisationData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organisation data')
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchOrganisationData()
    }
  }, [open, session?.user?.organisationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.organisationId) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Ensure working_days is an array before sending
      const submitData = {
        ...formData,
        working_days: Array.isArray(formData.working_days) ? formData.working_days : []
      }

      const response = await fetch(`/api/organisation/${session.user.organisationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) throw new Error('Failed to update organisation')

      const data = await response.json()

      onOrganisationUpdated(data.organisation)
      setSuccess(true)

      // Close drawer after showing success message for 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organisation')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof organisation, value: any) => {
    setFormData((prev: Partial<organisation>) => ({ ...prev, [field]: value }))
  }

  // Reset states when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setError(null)
      setSuccess(false)
    }
  }, [open])

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '50%',
          '@media (max-width: 1200px)': {
            width: '75%'
          },
          '@media (max-width: 600px)': {
            width: '100%'
          }
        }
      }}
    >
      <Box className='flex items-center justify-between p-6 border-b'>
        <Typography variant='h6'>{t('organisation.title')}</Typography>
        <IconButton size='small' onClick={onClose}>
          <i className='tabler-x' />
        </IconButton>
      </Box>

      <Box component='form' onSubmit={handleSubmit} className='p-6'>
        {error && (
          <Alert severity='error' onClose={() => setError(null)} className='mb-6'>
            {t('organisation.error')}
          </Alert>
        )}

        <Box className='grid grid-cols-2 gap-6'>
          {/* Left Column */}
          <Box className='space-y-6'>
            <Typography variant='subtitle1' className='font-medium'>
              {t('organisation.basicInfo')}
            </Typography>

            <TextField
              fullWidth
              label={t('organisation.name')}
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />

            <TextField
              fullWidth
              label={t('organisation.address')}
              value={formData.address || ''}
              onChange={e => handleChange('address', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label={t('organisation.phoneNumber')}
              value={formData.phone_number || ''}
              onChange={e => handleChange('phone_number', e.target.value)}
            />

            <TextField
              fullWidth
              label={t('organisation.email')}
              type='email'
              value={formData.email || ''}
              onChange={e => handleChange('email', e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>{t('organisation.status')}</InputLabel>
              <Select
                value={formData.status || 'enabled'}
                onChange={e => handleChange('status', e.target.value)}
                label={t('organisation.status')}
              >
                <MenuItem value='enabled'>{t('organisation.enabled')}</MenuItem>
                <MenuItem value='disabled'>{t('organisation.disabled')}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Right Column */}
          <Box className='space-y-6'>
            <Typography variant='subtitle1' className='font-medium'>
              {t('organisation.workingHours')}
            </Typography>

            <Box className='space-y-2'>
              <Typography variant='subtitle2' color='text.secondary'>
                {t('organisation.workingDays')}
              </Typography>
              <ToggleButtonGroup
                value={formData.working_days || []}
                onChange={(_, newValue) => handleChange('working_days', newValue)}
                aria-label='working days'
                className='flex flex-wrap gap-1'
                sx={{
                  '& .MuiToggleButton-root': {
                    border: '1px solid var(--mui-palette-divider)',
                    borderRadius: '4px !important',
                    margin: '0 !important',
                    padding: '4px 8px',
                    minWidth: '60px',
                    '&.Mui-selected': {
                      backgroundColor: 'var(--mui-palette-primary-main)',
                      color: 'var(--mui-palette-primary-contrastText)',
                      '&:hover': {
                        backgroundColor: 'var(--mui-palette-primary-dark)'
                      }
                    }
                  }
                }}
              >
                {workingDaysOptions.map(day => (
                  <ToggleButton key={day.value} value={day.value} aria-label={day.value} size='small'>
                    {day.short}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box className='space-y-4'>
              <Typography variant='subtitle2' color='text.secondary'>
                {t('organisation.workHours')}
              </Typography>
              <Box className='grid grid-cols-2 gap-4'>
                <TextField
                  fullWidth
                  label={t('organisation.startTime')}
                  type='time'
                  value={formData.work_start_time || ''}
                  onChange={e => handleChange('work_start_time', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label={t('organisation.endTime')}
                  type='time'
                  value={formData.work_end_time || ''}
                  onChange={e => handleChange('work_end_time', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            <Box className='space-y-4'>
              <Typography variant='subtitle2' color='text.secondary'>
                {t('organisation.breakHours')}
              </Typography>
              <Box className='grid grid-cols-2 gap-4'>
                <TextField
                  fullWidth
                  label={t('organisation.startTime')}
                  type='time'
                  value={formData.break_start_time || ''}
                  onChange={e => handleChange('break_start_time', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label={t('organisation.endTime')}
                  type='time'
                  value={formData.break_end_time || ''}
                  onChange={e => handleChange('break_end_time', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className='flex items-center justify-between gap-4 mt-6 pt-6 border-t'>
          {success ? (
            <Alert
              severity='success'
              className='flex-1'
              sx={{
                '& .MuiAlert-message': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }
              }}
            >
              <i className='tabler-check text-lg' />
              {t('organisation.success')}
            </Alert>
          ) : (
            <Box className='flex-1' />
          )}
          <Box className='flex gap-4'>
            <Button variant='tonal' color='secondary' onClick={onClose} disabled={loading}>
              {t('organisation.cancel')}
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {loading ? t('organisation.saving') : t('organisation.saveChanges')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default EditOrganisationDrawer
