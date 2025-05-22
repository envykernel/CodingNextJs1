'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
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

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

// Role-specific badge components
const RoleBadgeContentSpan = styled('span')<{ color: string }>(({ color }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: `var(--mui-palette-${color}-main)`,
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
}))

// Role-specific avatar components
const RoleAvatar = styled(Avatar)<{ color: string }>(({ color }) => ({
  border: `2px solid var(--mui-palette-${color}-main)`,
  '&:hover': {
    border: `2px solid var(--mui-palette-${color}-dark)`
  }
}))

// Role configuration
const roleConfig = {
  ADMIN: {
    color: 'error',
    icon: 'tabler-crown',
    label: 'Administrator'
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

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang } = useParams() as { lang?: string }

  // Translation for organisation label
  const translations: Record<string, Record<string, string>> = {
    en: { organisation: 'Organisation', role: 'Role' },
    fr: { organisation: 'Organisation', role: 'Rôle' },
    ar: { organisation: 'المؤسسة', role: 'الدور' }
  }

  const organisationName = (session?.user as any)?.organisationName
  const userRole = (session?.user as any)?.role as keyof typeof roleConfig
  const roleInfo = userRole ? roleConfig[userRole] : null
  const orgLabel = translations[lang || 'en']?.organisation || 'Organisation'
  const roleLabel = translations[lang || 'en']?.role || 'Role'

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

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={
          roleInfo ? (
            <RoleBadgeContentSpan color={roleInfo.color} onClick={handleDropdownOpen} />
          ) : (
            <BadgeContentSpan onClick={handleDropdownOpen} />
          )
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        {roleInfo ? (
          <RoleAvatar
            ref={anchorRef}
            alt={session?.user?.name || ''}
            src={session?.user?.image || ''}
            onClick={handleDropdownOpen}
            color={roleInfo.color}
            className='cursor-pointer bs-[38px] is-[38px]'
          />
        ) : (
          <Avatar
            ref={anchorRef}
            alt={session?.user?.name || ''}
            src={session?.user?.image || ''}
            onClick={handleDropdownOpen}
            className='cursor-pointer bs-[38px] is-[38px]'
          />
        )}
      </Badge>
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
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    {roleInfo ? (
                      <RoleAvatar
                        alt={session?.user?.name || ''}
                        src={session?.user?.image || ''}
                        color={roleInfo.color}
                      />
                    ) : (
                      <Avatar alt={session?.user?.name || ''} src={session?.user?.image || ''} />
                    )}
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {userRole === 'DOCTOR' ? `Dr. ${session?.user?.name || ''}` : session?.user?.name || ''}
                      </Typography>
                      <Typography variant='caption'>{session?.user?.email || ''}</Typography>
                      <Typography variant='caption' color={organisationName ? 'text.secondary' : 'error'}>
                        {orgLabel}: {organisationName ? organisationName : 'No Organisation'}
                      </Typography>
                      {userRole && roleInfo && (
                        <Typography variant='caption' color='text.secondary' className='flex items-center gap-1'>
                          {roleLabel}: {roleInfo.label}
                          <i
                            className={`${roleInfo.icon} text-[14px]`}
                            style={{ color: `var(--mui-palette-${roleInfo.color}-main)` }}
                          />
                        </Typography>
                      )}
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/user-profile')}>
                    <i className='tabler-user' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className='tabler-settings' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  {userRole === 'ADMIN' && (
                    <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/apps/organisation')}>
                      <i className='tabler-building' />
                      <Typography color='text.primary'>Organisation</Typography>
                    </MenuItem>
                  )}
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/pricing')}>
                    <i className='tabler-currency-dollar' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/faq')}>
                    <i className='tabler-help-circle' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
