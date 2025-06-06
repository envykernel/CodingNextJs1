'use client'

// React Imports
import { useState, useEffect } from 'react'

import classnames from 'classnames'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'

import { useTranslation } from '@/contexts/translationContext'

type ShortcutReference = {
  id: number
  title: string
  subtitle: string
  icon: string
}

type UserShortcut = {
  id: number
  shortcutId: number
  isActive: boolean
}

const SettingsTab = () => {
  // States
  const [availableShortcuts, setAvailableShortcuts] = useState<ShortcutReference[]>([])
  const [userShortcuts, setUserShortcuts] = useState<UserShortcut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Hooks
  const { t } = useTranslation()

  // Fetch available shortcuts and user's shortcuts
  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        // Fetch available shortcuts
        const shortcutsResponse = await fetch('/api/shortcuts/references')

        if (!shortcutsResponse.ok) throw new Error(t('settingsTab.errors.fetchFailed'))
        const shortcutsData = await shortcutsResponse.json()

        setAvailableShortcuts(shortcutsData)

        // Fetch user's shortcuts
        const userShortcutsResponse = await fetch('/api/shortcuts/user')

        if (!userShortcutsResponse.ok) throw new Error(t('settingsTab.errors.fetchFailed'))
        const userShortcutsData = await userShortcutsResponse.json()

        setUserShortcuts(userShortcutsData)

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('settingsTab.errors.fetchFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchShortcuts()
  }, [t])

  // Handle shortcut toggle
  const handleShortcutToggle = (shortcutId: number) => {
    setUserShortcuts(prev => {
      const existingShortcut = prev.find(us => us.shortcutId === shortcutId)

      if (existingShortcut) {
        return prev.map(us => (us.shortcutId === shortcutId ? { ...us, isActive: !us.isActive } : us))
      } else {
        return [
          ...prev,
          {
            id: 0,
            shortcutId,
            isActive: true
          }
        ]
      }
    })
  }

  // Save shortcuts
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/shortcuts/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userShortcuts)
      })

      if (!response.ok) throw new Error(t('settingsTab.errors.saveFailed'))

      setSuccess(t('settingsTab.success.settingsSaved'))

      // Dispatch a custom event to notify navbar components
      window.dispatchEvent(new CustomEvent('shortcutsUpdated'))

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settingsTab.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center p-6'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Shortcuts Settings */}
      <Card>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <div>
                <Typography variant='h5' className='mbe-1'>
                  {t('settingsTab.title')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {t('settingsTab.subtitle')}
                </Typography>
              </div>
              <Button
                variant='contained'
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <i className='tabler-device-floppy' />}
              >
                {saving ? t('settingsTab.saving') : t('settingsTab.saveChanges')}
              </Button>
            </div>

            {error && (
              <Alert severity='error' onClose={() => setError(null)} className='mbe-4'>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity='success' onClose={() => setSuccess(null)} className='mbe-4'>
                {success}
              </Alert>
            )}

            <Divider />

            <Grid container spacing={3}>
              {availableShortcuts
                .map(shortcut => {
                  const userShortcut = userShortcuts.find(us => us.shortcutId === shortcut.id)
                  const isEnabled = userShortcut?.isActive ?? false

                  return { ...shortcut, isEnabled }
                })
                .sort((a, b) => {
                  // First sort by enabled status (enabled first)
                  if (a.isEnabled !== b.isEnabled) {
                    return a.isEnabled ? -1 : 1
                  }

                  // For items with same status, sort by title
                  return a.title.localeCompare(b.title)
                })
                .map(shortcut => (
                  <Grid key={shortcut.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card
                      className={classnames(
                        'transition-all duration-200 h-full',
                        'shadow-sm hover:shadow-md',
                        !shortcut.isEnabled && 'opacity-60'
                      )}
                    >
                      <CardContent className='flex flex-col h-full'>
                        <div className='flex flex-col gap-3 h-full'>
                          <div className='flex items-center gap-3'>
                            <Box
                              className={classnames(
                                'flex items-center justify-center rounded-lg p-2',
                                shortcut.isEnabled ? 'bg-primary bg-opacity-10' : 'bg-actionHover'
                              )}
                            >
                              <span
                                className={classnames(
                                  'inline-flex items-center justify-center',
                                  shortcut.icon,
                                  'text-textPrimary'
                                )}
                                style={{
                                  fontSize: '1.5rem',
                                  width: '1.5rem',
                                  height: '1.5rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                aria-hidden='true'
                              />
                            </Box>
                            <div className='flex-grow'>
                              <Typography
                                variant='subtitle1'
                                className={classnames(!shortcut.isEnabled && 'text-textDisabled')}
                              >
                                {shortcut.title}
                              </Typography>
                              <Typography variant='body2' color='text.secondary' className='line-clamp-2'>
                                {shortcut.subtitle}
                              </Typography>
                            </div>
                          </div>

                          <div className='flex items-center justify-between mt-auto pt-3 border-t border-divider'>
                            <Switch
                              checked={shortcut.isEnabled}
                              onChange={() => handleShortcutToggle(shortcut.id)}
                              color='primary'
                            />
                            <Typography
                              variant='body2'
                              className={classnames(
                                'font-medium',
                                shortcut.isEnabled ? 'text-primary' : 'text-textDisabled'
                              )}
                            >
                              {shortcut.isEnabled ? t('settingsTab.active') : t('settingsTab.inactive')}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>

            <div className='flex items-center gap-2 text-textSecondary'>
              <i className='tabler-info-circle text-lg' />
              <Typography variant='body2'>{t('settingsTab.disabledShortcutsInfo')}</Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsTab
