'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import type { Theme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { CustomAvatarProps } from '@core/components/mui/Avatar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import NotificationsDrawer from './NotificationsDrawer'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { useTranslation } from '@/contexts/translationContext'

// Util Imports
import { getInitials } from '@/utils/getInitials'

export type NotificationsType = {
  id: number
  title: string
  subtitle: string
  time: string
  read: boolean
  avatarIcon?: string
  avatarColor?: ThemeColor
  avatarSkin?: CustomAvatarProps['skin']
  avatarImage?: string
  avatarText?: string
}

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<NotificationsType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationsType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { t } = useTranslation()

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()

      setNotifications(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  // Fetch notifications on mount and periodically
  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  // Also fetch when dropdown is opened to ensure fresh data
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Mark notification as read
  const handleReadNotification = async (event: MouseEvent<HTMLElement>, notificationId: number) => {
    event.stopPropagation()

    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Remove the notification from the list instead of marking it as read
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // Mark all notifications as read
  const readAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Update notifications in state to mark all as read
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  // Calculate notification count
  const notificationCount = notifications.filter(notification => !notification.read).length
  const readAll = notifications.every(notification => notification.read)

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)

    return () => window.removeEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 6, right: 5, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='tabler-bell' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-3 z-[1] max-bs-[550px] bs-[550px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96 !mbs-3 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      {t('notifications.all')}
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip size='small' variant='tonal' color='primary' label={notificationCount} />
                    )}
                    <Tooltip
                      title={readAll ? t('notifications.markAsRead') : t('notifications.markAllAsRead')}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      {notifications.length > 0 ? (
                        <IconButton size='small' onClick={readAllNotifications} className='text-textPrimary'>
                          <i className={readAll ? 'tabler-mail' : 'tabler-mail-opened'} />
                        </IconButton>
                      ) : (
                        <span>
                          <IconButton size='small' className='text-textPrimary' disabled>
                            <i className='tabler-mail' />
                          </IconButton>
                        </span>
                      )}
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {loading ? (
                      <div className='flex items-center justify-center p-4'>
                        <CircularProgress size={24} />
                        <Typography className='ml-2'>{t('notifications.loading')}</Typography>
                      </div>
                    ) : error ? (
                      <div className='flex items-center justify-center p-4'>
                        <Typography color='error'>{t('notifications.error')}</Typography>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className='flex items-center justify-center p-4'>
                        <Typography color='text.secondary'>{t('notifications.noNotifications')}</Typography>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notification, index) => {
                          const {
                            id,
                            title,
                            subtitle,
                            time,
                            read,
                            avatarImage,
                            avatarIcon,
                            avatarText,
                            avatarColor,
                            avatarSkin
                          } = notification

                          return (
                            <div
                              key={id}
                              className={classnames(
                                'flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group',
                                {
                                  'border-be': index !== notifications.length - 1
                                }
                              )}
                              onClick={(e: MouseEvent<HTMLElement>) => handleReadNotification(e, id)}
                            >
                              {getAvatar({ avatarImage, avatarIcon, title, avatarText, avatarColor, avatarSkin })}
                              <div className='flex flex-col flex-auto'>
                                <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
                                  {title}
                                </Typography>
                                <Typography variant='caption' color='text.secondary' className='mbe-2'>
                                  {subtitle}
                                </Typography>
                                <Typography variant='caption' color='text.disabled'>
                                  {time}
                                </Typography>
                              </div>
                              <div className='flex flex-col items-end gap-2'>
                                <Badge
                                  variant='dot'
                                  color={read ? 'secondary' : 'primary'}
                                  className={classnames('mbs-1 mie-1', {
                                    'invisible group-hover:visible': read
                                  })}
                                  title={read ? t('notifications.read') : t('notifications.unread')}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      size='small'
                      onClick={() => {
                        setDrawerOpen(true)
                        handleClose()
                      }}
                    >
                      {t('notifications.viewAll')}
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <NotificationsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

export default NotificationDropdown
