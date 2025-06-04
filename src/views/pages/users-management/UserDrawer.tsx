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
  DialogActions,
  Alert
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

// Hook Imports
import type { UserRole } from '@prisma/client'

import { useTranslation } from '@/contexts/translationContext'

// Constants
const ROLE_CONFIG: Record<UserRole, { icon: string; color: string }> = {
  ADMIN: { icon: 'tabler-user-shield', color: 'error' },
  CABINET_MANAGER: { icon: 'tabler-stethoscope', color: 'warning' },
  DOCTOR: { icon: 'tabler-user-md', color: 'primary' },
  NURSE: { icon: 'tabler-nurse', color: 'info' },
  RECEPTIONIST: { icon: 'tabler-receipt', color: 'success' },
  ACCOUNTANT: { icon: 'tabler-calculator', color: 'warning' },
  LAB_TECHNICIAN: { icon: 'tabler-microscope', color: 'secondary' },
  PHARMACIST: { icon: 'tabler-pill', color: 'info' },
  USER: { icon: 'tabler-user', color: 'default' }
} as const

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
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  // Reset form and error when drawer opens/closes
  useEffect(() => {
    if (open) {
      setEmailError(null)
      setNameError(null)

      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'USER',
          isApproved: user.isApproved === true,
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
    }
  }, [user, organisationId, open])

  const checkEmailExists = async (email: string, userId?: string): Promise<boolean> => {
    try {
      setIsCheckingEmail(true)
      setEmailError(null)

      const response = await fetch(
        `/api/users/check-email?email=${encodeURIComponent(email)}${userId ? `&excludeUserId=${userId}` : ''}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(errorData?.error || translate('error.emailCheck'))
      }

      const data = await response.json()

      return data.exists
    } catch (error) {
      console.error('Error checking email:', error)

      if (error instanceof Error) {
        setEmailError(error.message)
      } else {
        setEmailError(translate('error.emailCheck'))
      }

      throw error
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const checkNameExists = async (name: string, organisationId: number, userId?: string): Promise<boolean> => {
    try {
      setIsCheckingName(true)
      setNameError(null)

      const response = await fetch(
        `/api/users/check-username?name=${encodeURIComponent(name)}&organisationId=${organisationId}${
          userId ? `&excludeUserId=${userId}` : ''
        }`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(errorData?.error || translate('error.nameCheck'))
      }

      const data = await response.json()

      return data.exists
    } catch (error) {
      console.error('Error checking name:', error)

      if (error instanceof Error) {
        setNameError(error.message)
      } else {
        setNameError(translate('error.nameCheck'))
      }

      throw error
    } finally {
      setIsCheckingName(false)
    }
  }

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setNameError(null)

    try {
      // Check if name already exists in the organization
      const nameExists = await checkNameExists(formData.name, formData.organisationId, user?.id)

      if (nameExists) {
        setNameError(translate('error.nameExists'))

        return
      }

      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email, user?.id)

      if (emailExists) {
        setEmailError(translate('error.emailExists'))

        return
      }

      // Check if role is being changed to ADMIN
      const isChangingToAdmin = formData.role === 'ADMIN'
      const isNewUser = !user
      const isExistingUserChangingToAdmin = user && user.role !== 'ADMIN' && isChangingToAdmin

      if ((isNewUser && isChangingToAdmin) || isExistingUserChangingToAdmin) {
        setShowAdminConfirmDialog(true)
        setPendingSubmit(() => async () => {
          try {
            await onSubmit(formData)
            onClose()
          } catch (error) {
            console.error('Error submitting user:', error)

            if (error instanceof Error) {
              if (error.message.includes('email')) {
                setEmailError(error.message)
              } else if (error.message.includes('name')) {
                setNameError(error.message)
              } else {
                setEmailError(translate('error.createUser'))
              }
            } else {
              setEmailError(translate('error.createUser'))
            }
          }
        })

        return
      }

      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting user:', error)

      if (error instanceof Error) {
        if (error.message.includes('email')) {
          setEmailError(error.message)
        } else if (error.message.includes('name')) {
          setNameError(error.message)
        } else {
          setEmailError(translate('error.createUser'))
        }
      } else {
        setEmailError(translate('error.createUser'))
      }
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
              {(emailError || nameError) && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {emailError || nameError}
                </Alert>
              )}

              <TextField
                fullWidth
                label={translate('form.name')}
                placeholder={translate('form.namePlaceholder')}
                value={formData.name}
                onChange={e => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  setNameError(null)
                }}
                required
                disabled={isCheckingName}
                error={!!nameError}
                helperText={nameError}
              />

              <TextField
                fullWidth
                type='email'
                label={translate('form.email')}
                placeholder={translate('form.emailPlaceholder')}
                value={formData.email}
                onChange={e => {
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                  setEmailError(null)
                }}
                required
                disabled={isCheckingEmail}
                error={!!emailError}
                helperText={emailError}
              />

              <FormControl fullWidth>
                <InputLabel>{translate('form.role')}</InputLabel>
                <Select
                  value={formData.role}
                  label={translate('form.role')}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  required
                >
                  {Object.entries(ROLE_CONFIG).map(([role, config]) => (
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
                    onChange={e => setFormData(prev => ({ ...prev, isApproved: e.target.checked }))}
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
                <Button type='submit' variant='contained' fullWidth disabled={isCheckingEmail}>
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
          {translate('confirmation.adminRole.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>{translate('confirmation.adminRole.message')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdminRole} color='primary'>
            {translate('confirmation.adminRole.cancel')}
          </Button>
          <Button onClick={handleConfirmAdminRole} color='warning' variant='contained' autoFocus>
            {translate('confirmation.adminRole.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserDrawer
