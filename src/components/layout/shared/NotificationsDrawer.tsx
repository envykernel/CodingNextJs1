'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'

// Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { CustomAvatarProps } from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { useTranslation } from '@/contexts/translationContext'

export type NotificationType = {
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

interface NotificationsDrawerProps {
  open: boolean
  onClose: () => void
}

const getAvatar = (
  params: Pick<NotificationType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
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

const NotificationsDrawer = ({ open, onClose }: NotificationsDrawerProps) => {
  // States
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  // Fetch all notifications
  const fetchAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/all')

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

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (open) {
      fetchAllNotifications()
    }
  }, [open])

  // Mark notification as read
  const handleReadNotification = async (event: MouseEvent<HTMLElement>, notificationId: number) => {
    event.stopPropagation()

    // Find the notification in the current state
    const notification = notifications.find(n => n.id === notificationId)

    // If notification is already read, do nothing
    if (notification?.read) {
      return
    }

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

      // Update the notification's read status in the state
      setNotifications(prev =>
        prev.map(notification => (notification.id === notificationId ? { ...notification, read: true } : notification))
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%'
        }
      }}
    >
      <Box className='flex items-center justify-between plb-3.5 pli-4'>
        <Typography variant='h6'>{t('notifications.all')}</Typography>
        <IconButton size='small' onClick={onClose} className='text-textPrimary'>
          <i className='tabler-x' />
        </IconButton>
      </Box>
      <Divider />
      <PerfectScrollbar className='bs-[calc(100%-4rem)]'>
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
          notifications.map(notification => {
            const { id, title, subtitle, time, read, avatarImage, avatarIcon, avatarText, avatarColor, avatarSkin } =
              notification

            return (
              <div
                key={id}
                className='flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group border-be last:border-be-0'
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
          })
        )}
      </PerfectScrollbar>
    </Drawer>
  )
}

export default NotificationsDrawer
