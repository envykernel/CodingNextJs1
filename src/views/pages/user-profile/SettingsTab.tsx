'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

type ShortcutReference = {
  id: number
  title: string
  subtitle: string
  icon: string
}

type UserShortcut = {
  id: number
  shortcutId: number
  displayOrder: number
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

  // Fetch available shortcuts and user's shortcuts
  useEffect(() => {
    const fetchShortcuts = async () => {
      try {
        // Fetch available shortcuts
        const shortcutsResponse = await fetch('/api/shortcuts/references')

        if (!shortcutsResponse.ok) throw new Error('Failed to fetch available shortcuts')
        const shortcutsData = await shortcutsResponse.json()

        setAvailableShortcuts(shortcutsData)

        // Fetch user's shortcuts
        const userShortcutsResponse = await fetch('/api/shortcuts/user')

        if (!userShortcutsResponse.ok) throw new Error('Failed to fetch user shortcuts')
        const userShortcutsData = await userShortcutsResponse.json()

        setUserShortcuts(userShortcutsData)

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch shortcuts')
      } finally {
        setLoading(false)
      }
    }

    fetchShortcuts()
  }, [])

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
            displayOrder: prev.length,
            isActive: true
          }
        ]
      }
    })
  }

  // Handle reordering
  const moveShortcut = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === userShortcuts.length - 1)) {
      return
    }

    const newShortcuts = [...userShortcuts]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newShortcuts[index]

    newShortcuts[index] = newShortcuts[newIndex]
    newShortcuts[newIndex] = temp

    newShortcuts.forEach((shortcut, idx) => {
      shortcut.displayOrder = idx
    })

    setUserShortcuts(newShortcuts)
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

      if (!response.ok) throw new Error('Failed to save shortcuts')

      setSuccess('Settings saved successfully')

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
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
            <Typography variant='h5'>Shortcuts Settings</Typography>

            {error && (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity='success' onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Typography variant='body2' color='text.secondary'>
              Select the shortcuts you want to use and arrange them in your preferred order. Use the arrow buttons to
              reorder your shortcuts.
            </Typography>

            <div className='flex flex-col gap-4'>
              {availableShortcuts.map(shortcut => {
                const userShortcut = userShortcuts.find(us => us.shortcutId === shortcut.id)
                const isEnabled = userShortcut?.isActive ?? false
                const index = userShortcuts.findIndex(us => us.shortcutId === shortcut.id)

                return (
                  <Card key={shortcut.id} className='border border-divider'>
                    <CardContent>
                      <div className='flex items-center gap-4'>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isEnabled}
                              onChange={() => handleShortcutToggle(shortcut.id)}
                              color='primary'
                            />
                          }
                          label={
                            <div className='flex items-center gap-2'>
                              <i className={`${shortcut.icon} text-2xl`} />
                              <div className='flex-grow'>
                                <Typography variant='subtitle1'>{shortcut.title}</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                  {shortcut.subtitle}
                                </Typography>
                              </div>
                            </div>
                          }
                          className='flex-grow'
                        />
                        {isEnabled && (
                          <div className='flex flex-col gap-1'>
                            <IconButton size='small' onClick={() => moveShortcut(index, 'up')} disabled={index === 0}>
                              <i className='tabler-chevron-up' />
                            </IconButton>
                            <IconButton
                              size='small'
                              onClick={() => moveShortcut(index, 'down')}
                              disabled={index === userShortcuts.length - 1}
                            >
                              <i className='tabler-chevron-down' />
                            </IconButton>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className='flex justify-end'>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

export default SettingsTab
