'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import {
  Drawer,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  Divider,
  Alert
} from '@mui/material'

// Hook Imports
import type { UserRole } from '@prisma/client'

import { useTranslation } from '@/contexts/translationContext'

// Config Imports
import { roleConfig } from '@/configs/roleConfig'

// Type Imports
import type { RoleConfig } from '@/configs/roleConfig'

interface UserDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => Promise<void>
  user?: {
    id: string
    name: string
    email: string
    role: UserRole | null
    isApproved: boolean
    organisationId: number | null
  }
  organisationId: number
}

export interface UserFormData {
  name: string
  email: string
  role: UserRole
  isApproved: boolean
  organisationId: number
}

const UserDrawer = ({ open, onClose, onSubmit, user, organisationId }: UserDrawerProps) => {
  const { t } = useTranslation()
  const translate = (key: string) => t(`userDrawer.${key}`)

  // Initialize form data with default values
  const initialFormData: UserFormData = {
    name: '',
    email: '',
    role: 'USER',
    isApproved: false,
    organisationId
  }

  // Form state
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Reset form when user changes or drawer opens/closes
  useEffect(() => {
    console.log('useEffect - User changed:', user)
    console.log('useEffect - isApproved value:', user?.isApproved, 'type:', typeof user?.isApproved)

    if (user) {
      // Convert isApproved to boolean explicitly
      const isApproved = user.isApproved === true

      console.log('useEffect - Converted isApproved:', isApproved, 'type:', typeof isApproved)

      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'USER',
        isApproved,
        organisationId: user.organisationId || organisationId
      })
    } else {
      setFormData(initialFormData)
    }
  }, [user, organisationId, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage(null)

    try {
      await onSubmit(formData)
      setSuccessMessage(user ? translate('success.update') : translate('success.create'))

      // Close drawer after a short delay to show the success message
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error submitting form:', error)
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
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h5'>{user ? translate('title.edit') : translate('title.add')}</Typography>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        {successMessage && (
          <Alert severity='success' sx={{ mb: 4 }}>
            {successMessage}
          </Alert>
        )}

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <TextField
              fullWidth
              label={translate('form.name')}
              placeholder={translate('form.namePlaceholder')}
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <TextField
              fullWidth
              type='email'
              label={translate('form.email')}
              placeholder={translate('form.emailPlaceholder')}
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />

            <FormControl fullWidth>
              <InputLabel>{translate('form.role')}</InputLabel>
              <Select
                value={formData.role}
                label={translate('form.role')}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                required
              >
                {(Object.entries(roleConfig) as [UserRole, RoleConfig][]).map(([role, config]) => (
                  <MenuItem key={role} value={role}>
                    <div className='flex items-center gap-2'>
                      <i className={config.icon} style={{ color: `var(--mui-palette-${config.color}-main)` }} />
                      <span>{t(`usersManagement.roles.${role}`)}</span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isApproved === true}
                  onChange={e => {
                    console.log('Switch changed to:', e.target.checked)
                    setFormData(prev => ({ ...prev, isApproved: e.target.checked }))
                  }}
                />
              }
              label={
                <div>
                  <Typography>{translate('form.isApproved')}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {translate('form.isApprovedDescription')}
                  </Typography>
                </div>
              }
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant='outlined' onClick={onClose} fullWidth>
                {translate('form.cancel')}
              </Button>
              <Button type='submit' variant='contained' fullWidth disabled={loading}>
                {user ? translate('form.save') : translate('form.create')}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default UserDrawer
