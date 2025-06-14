'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Type Imports
import type { Locale } from '@configs/i18n'

// Component Imports
import EditOrganisationDrawer from '@/components/organisation/EditOrganisationDrawer'
import ServicesDrawer from '@/components/services/ServicesDrawer'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { useTranslation } from '@/contexts/translationContext'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Role configuration
const roleConfig = {
  ADMIN: {
    color: 'error',
    icon: 'tabler-crown',
    label: 'Administrator'
  },
  CABINET_MANAGER: {
    color: 'warning',
    icon: 'tabler-building-hospital',
    label: 'Cabinet Manager'
  },
  DOCTOR: {
    color: 'primary',
    icon: 'tabler-stethoscope',
    label: 'Doctor'
  },
  NURSE: {
    color: 'info',
    icon: 'tabler-heartbeat',
    label: 'Nurse'
  },
  RECEPTIONIST: {
    color: 'success',
    icon: 'tabler-calendar-event',
    label: 'Receptionist'
  },
  ACCOUNTANT: {
    color: 'warning',
    icon: 'tabler-calculator',
    label: 'Accountant'
  },
  LAB_TECHNICIAN: {
    color: 'secondary',
    icon: 'tabler-microscope',
    label: 'Lab Technician'
  },
  PHARMACIST: {
    color: 'error',
    icon: 'tabler-pill',
    label: 'Pharmacist'
  },
  USER: {
    color: 'success',
    icon: 'tabler-user',
    label: 'User'
  }
} as const

// Role to icon mapping
const roleIcons: Record<string, string> = {
  ADMIN: 'tabler-shield-check',
  DOCTOR: 'tabler-stethoscope',
  NURSE: 'tabler-nurse',
  CABINET_MANAGER: 'tabler-building-hospital',
  RECEPTIONIST: 'tabler-clipboard-check',
  PATIENT: 'tabler-user'
}

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [organisationDrawerOpen, setOrganisationDrawerOpen] = useState(false)
  const [servicesDrawerOpen, setServicesDrawerOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang } = useParams() as { lang?: string }
  const { t } = useTranslation()
  const theme = useTheme()

  // Translation for organisation label only (removed role translation)
  const translations: Record<string, Record<string, string>> = {
    en: { organisation: 'Organisation' },
    fr: { organisation: 'Organisation' },
    ar: { organisation: 'المؤسسة' }
  }

  const organisationName = (session?.user as any)?.organisationName
  const userRole = session?.user?.role as keyof typeof roleConfig
  const roleIcon = userRole ? roleIcons[userRole] || 'tabler-user' : 'tabler-user'
  const orgLabel = translations[lang || 'en']?.organisation || 'Organisation'
  const isAdmin = userRole === 'ADMIN'
  const isCabinetManager = userRole === 'CABINET_MANAGER'
  const canManageOrg = isAdmin || isCabinetManager

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(getLocalizedUrl(url, lang as Locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })
    } catch (error) {
      console.error(error)

      // Show above error in a toast like following
      // toastService.error((err as Error).message)
    }
  }

  const handleOrganisationClick = (e: MouseEvent<HTMLLIElement>) => {
    e.preventDefault()
    setOrganisationDrawerOpen(true)
    setOpen(false)
  }

  const handleServicesClick = (e: MouseEvent<HTMLLIElement>) => {
    e.preventDefault()
    setServicesDrawerOpen(true)
    setOpen(false)
  }

  const handleOrganisationUpdated = () => {
    // Update the session with new organisation data
    // This will trigger a re-render with updated data
    window.location.reload()
  }

  return (
    <div>
      <Avatar
        ref={anchorRef}
        onClick={handleDropdownOpen}
        className='cursor-pointer bs-[38px] is-[38px] mis-2'
        sx={{
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)'
              : 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
          '& i': {
            color: theme.palette.primary.main,
            opacity: 1
          }
        }}
      >
        <i className={`${roleIcon} text-[20px]`} />
      </Avatar>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <MenuItem className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    <Avatar
                      sx={{
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)'
                            : 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                        '& i': {
                          color: theme.palette.primary.main,
                          opacity: 1
                        }
                      }}
                    >
                      <i className={`${roleIcon} text-[20px]`} />
                    </Avatar>
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {userRole === 'DOCTOR' ? `Dr. ${session?.user?.name || ''}` : session?.user?.name || ''}
                      </Typography>
                      <Typography variant='caption'>{session?.user?.email || ''}</Typography>
                      <Typography variant='caption' color={organisationName ? 'text.secondary' : 'error'}>
                        {orgLabel}: {organisationName ? organisationName : 'No Organisation'}
                      </Typography>
                    </div>
                  </MenuItem>
                  <Divider className='mlb-1' />
                  {isAdmin && [
                    <MenuItem
                      key='profile'
                      className='mli-2 gap-3'
                      onClick={e => handleDropdownClose(e, '/pages/user-profile')}
                    >
                      <i className='tabler-user' />
                      <Typography color='text.primary'>{t('userMenu.myProfile')}</Typography>
                    </MenuItem>,
                    <MenuItem
                      key='settings'
                      className='mli-2 gap-3'
                      onClick={e => handleDropdownClose(e, '/pages/account-settings')}
                    >
                      <i className='tabler-settings' />
                      <Typography color='text.primary'>{t('userMenu.settings')}</Typography>
                    </MenuItem>,
                    <MenuItem
                      key='pricing'
                      className='mli-2 gap-3'
                      onClick={e => handleDropdownClose(e, '/pages/pricing')}
                    >
                      <i className='tabler-currency-dollar' />
                      <Typography color='text.primary'>{t('userMenu.pricing')}</Typography>
                    </MenuItem>
                  ]}
                  {canManageOrg && (
                    <MenuItem className='mli-2 gap-3' onClick={handleOrganisationClick}>
                      <i className='tabler-building' />
                      <Typography color='text.primary'>{t('userMenu.organisation')}</Typography>
                    </MenuItem>
                  )}
                  {(isAdmin || isCabinetManager) && (
                    <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/users-management')}>
                      <i className='tabler-users' />
                      <Typography color='text.primary'>{t('userMenu.usersManagement')}</Typography>
                    </MenuItem>
                  )}
                  {(userRole === 'ADMIN' || userRole === 'CABINET_MANAGER') && (
                    <MenuItem className='mli-2 gap-3' onClick={handleServicesClick}>
                      <i className='tabler-clipboard-list' />
                      <Typography color='text.primary'>{t('userMenu.services')}</Typography>
                    </MenuItem>
                  )}
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/faq')}>
                    <i className='tabler-help-circle' />
                    <Typography color='text.primary'>{t('userMenu.faq')}</Typography>
                  </MenuItem>
                  <MenuItem className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      {t('userMenu.logout')}
                    </Button>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <EditOrganisationDrawer
        open={organisationDrawerOpen}
        onClose={() => setOrganisationDrawerOpen(false)}
        onOrganisationUpdated={handleOrganisationUpdated}
      />

      <ServicesDrawer open={servicesDrawerOpen} onClose={() => setServicesDrawerOpen(false)} />
    </div>
  )
}

export default UserDropdown
