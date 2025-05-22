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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

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

const UserDrawer = ({ open, onClose, user, onSubmit, organisationId }: UserDrawerProps) => {
  const { t } = useTranslation()
  const translate = (key: string) => t(`userDrawer.${key}`)
  const translateRole = (key: string) => t(`usersManagement.roles.${key}`)

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'USER',
    isApproved: false,
    organisationId: organisationId
  })

  const [showAdminConfirmDialog, setShowAdminConfirmDialog] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<(() => void) | null>(null)

  // Add translations for confirmation dialog
  const confirmDialogTranslations = {
    title: translate('confirmation.adminRole.title'),
    message: translate('confirmation.adminRole.message'),
    confirm: translate('confirmation.adminRole.confirm'),
    cancel: translate('confirmation.adminRole.cancel')
  }

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
      setFormData({
        name: '',
        email: '',
        role: 'USER',
        isApproved: false,
        organisationId
      })
    }
  }, [user, organisationId, open])

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if role is being changed to ADMIN
    const isChangingToAdmin = formData.role === 'ADMIN'
    const isNewUser = !user
    const isExistingUserChangingToAdmin = user && user.role !== 'ADMIN' && isChangingToAdmin

    if ((isNewUser && isChangingToAdmin) || isExistingUserChangingToAdmin) {
      // Show confirmation dialog
      setShowAdminConfirmDialog(true)

      // Store the submit function to be called after confirmation
      setPendingSubmit(() => async () => {
        try {
          await onSubmit(formData)
          onClose()
        } catch (error) {
          console.error('Error submitting user:', error)
        }
      })

      return
    }

    // If not changing to admin, proceed normally
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting user:', error)
    }
  }

  const handleConfirmAdminRole = () => {
    setShowAdminConfirmDialog(false)

    if (pendingSubmit) {
      pendingSubmit()
      setPendingSubmit(null)
    }
  }

  const handleCancelAdminRole = () => {
    setShowAdminConfirmDialog(false)
    setPendingSubmit(null)
  }

  return (
    <>
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
            <IconButton size='small' onClick={onClose} sx={{ color: 'text.primary' }}>
              <i className='tabler-x' />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <form onSubmit={handleSubmitUser}>
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
                        <span>{translateRole(role)}</span>
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
                <Button type='submit' variant='contained' fullWidth>
                  {user ? translate('form.save') : translate('form.create')}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Drawer>

      <Dialog
        open={showAdminConfirmDialog}
        onClose={handleCancelAdminRole}
        aria-labelledby='admin-role-confirm-dialog-title'
      >
        <DialogTitle id='admin-role-confirm-dialog-title' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color='warning' sx={{ fontSize: 28 }} />
          {confirmDialogTranslations.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>{confirmDialogTranslations.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdminRole} color='primary'>
            {confirmDialogTranslations.cancel}
          </Button>
          <Button onClick={handleConfirmAdminRole} color='warning' variant='contained' autoFocus>
            {confirmDialogTranslations.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserDrawer
