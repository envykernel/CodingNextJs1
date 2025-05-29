'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import PerfectScrollbar from 'react-perfect-scrollbar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import Switch from '@mui/material/Switch'
import Pagination from '@mui/material/Pagination'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

// Contexts
import { useTranslation } from '@/contexts/translationContext'

// Types
interface Service {
  id?: string
  code: string
  name: string
  description: string
  amount: number
  is_active: boolean
}

interface ServicesDrawerProps {
  open: boolean
  onClose: () => void
}

const ServicesDrawer = ({ open, onClose }: ServicesDrawerProps) => {
  // States
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'amount'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Pagination states
  const [page, setPage] = useState(1)
  const itemsPerPage = 8

  // Hooks
  const { t } = useTranslation()

  // Fetch services on drawer open
  useEffect(() => {
    if (open) {
      fetchServices()
    }
  }, [open])

  // Reset state when drawer is closed
  useEffect(() => {
    if (!open) {
      setServices([])
      setLoading(true)
      setError(null)
      setEditingService(null)
      setIsSubmitting(false)
      setSearchQuery('')
      setStatusFilter('all')
      setSortBy('name')
      setSortOrder('asc')
      setPage(1)
    }
  }, [open])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/services')

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()

      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.is_active) ||
        (statusFilter === 'inactive' && !service.is_active)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)

  const paginatedServices = filteredServices.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleEditService = (service: Service) => {
    setEditingService(service)
  }

  const handleAddService = () => {
    setError(null)

    // Create a new empty service object without an id
    const newService: Omit<Service, 'id'> = {
      code: '',
      name: '',
      description: '',
      amount: 0,
      is_active: true
    }

    // Set it as the editing service immediately
    setEditingService(newService as Service)
  }

  const handleSaveService = async (service: Service) => {
    if (!service) return

    try {
      setIsSubmitting(true)
      setError(null)

      // Validate required fields
      if (!service.name || service.name.trim().length === 0) {
        setError(t('services.error.nameRequired'))

        return
      }

      // For existing services, use PUT
      if (service.id) {
        const currentService = services.find(s => s.id === service.id)

        // Only validate amount if it's being changed
        if (service.amount !== currentService?.amount) {
          if (typeof service.amount !== 'number' || service.amount <= 0) {
            setError(t('services.error.invalidAmount'))

            return
          }
        }

        const requestBody: any = {
          is_active: service.is_active
        }

        // Only include amount if it's different from current amount
        if (service.amount !== currentService?.amount) {
          requestBody.amount = service.amount
        }

        const response = await fetch(`/api/services/${service.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(t(data.error || 'services.error.update'))
        }

        setServices(prevServices => prevServices.map(s => (s.id === service.id ? data : s)))
        setEditingService(null)
      } else {
        // For new services (no id), use POST
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: service.name,
            description: service.description,
            amount: service.amount,
            is_active: service.is_active
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(t(data.error || 'services.error.create'))
        }

        setServices(prevServices => [...prevServices, data])
        setEditingService(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('services.error.unknown'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!serviceId) return

    if (!confirm(t('services.confirmDelete'))) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(t(data.error || 'services.error.delete'))
      }

      setServices(prevServices => prevServices.filter(s => s.id !== serviceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('services.error.unknown'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor='right'
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '75%' },
          boxShadow: theme => theme.shadows[8]
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='h5'>{t('services.title')}</Typography>
            <Chip label={services.length} color='primary' size='small' sx={{ height: 20 }} />
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        {/* Search and Filters */}
        <Box
          sx={{
            p: 5,
            pb: 4,
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
            mb: 4
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper
                component='form'
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  border: theme => `1px solid ${theme.palette.divider}`
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder={t('services.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  startAdornment={
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  }
                />
                {searchQuery && (
                  <IconButton
                    size='small'
                    onClick={() => {
                      setSearchQuery('')
                      setPage(1)
                    }}
                  >
                    <i className='tabler-x' />
                  </IconButton>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel id='service-status-label'>{t('services.statusLabel')}</InputLabel>
                    <Select
                      labelId='service-status-label'
                      value={statusFilter}
                      label={t('services.statusLabel')}
                      onChange={e => {
                        setStatusFilter(e.target.value as typeof statusFilter)
                        setPage(1)
                      }}
                    >
                      <MenuItem value='all'>{t('services.allStatus')}</MenuItem>
                      <MenuItem value='active'>{t('services.status.active')}</MenuItem>
                      <MenuItem value='inactive'>{t('services.status.inactive')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>{t('services.sortBy')}</InputLabel>
                    <Select
                      value={sortBy}
                      label={t('services.sortBy')}
                      onChange={e => {
                        const newSortBy = e.target.value as typeof sortBy

                        setSortBy(newSortBy)
                        setSortOrder('asc')
                        setPage(1)
                      }}
                    >
                      <MenuItem value='name'>{t('services.sortByName')}</MenuItem>
                      <MenuItem value='amount'>{t('services.sortByAmount')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={handleAddService}
                disabled={isSubmitting || editingService !== null}
                size='small'
                sx={{
                  textTransform: 'none',
                  px: 2,
                  whiteSpace: 'nowrap',
                  minWidth: 'auto'
                }}
              >
                {t('services.addNew')}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Content */}
        <PerfectScrollbar options={{ wheelPropagation: false }}>
          <Box sx={{ p: 5, height: '100%' }}>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* New Service Form */}
                {editingService && !editingService.id && (
                  <Card sx={{ mb: 4 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                          fullWidth
                          required
                          label={t('services.name')}
                          value={editingService!.name}
                          onChange={e => {
                            if (!editingService) return
                            setEditingService({ ...editingService, name: e.target.value })
                          }}
                          error={error?.includes('name')}
                          helperText={error?.includes('name') ? error : ''}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <i className='tabler-tag' />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme => theme.palette.background.paper
                            }
                          }}
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label={t('services.description')}
                          value={editingService!.description}
                          onChange={e => {
                            if (!editingService) return
                            setEditingService({ ...editingService, description: e.target.value })
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <i className='tabler-file-description' />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme => theme.palette.background.paper
                            }
                          }}
                        />
                        <TextField
                          fullWidth
                          type='number'
                          label={t('services.amount')}
                          value={editingService?.amount ?? 0}
                          onChange={e => {
                            const value = Number(e.target.value)

                            if (value > 0 && editingService) {
                              setEditingService({
                                ...editingService,
                                amount: value
                              })
                            }
                          }}
                          inputProps={{
                            min: 0.01,
                            step: 0.01
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position='end'>MAD</InputAdornment>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme => theme.palette.background.paper,
                              '& .MuiInputBase-input': {
                                fontWeight: 600,
                                color: 'primary.main',
                                fontSize: '1.1rem'
                              }
                            }
                          }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: theme => theme.palette.action.hover
                          }}
                        >
                          <Typography sx={{ fontWeight: 500 }}>{t('services.isActive')}</Typography>
                          <Switch
                            checked={editingService!.is_active}
                            onChange={e => {
                              if (!editingService) return
                              setEditingService({ ...editingService, is_active: e.target.checked })
                            }}
                            color='success'
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                          <Button
                            variant='outlined'
                            onClick={() => {
                              setEditingService(null)
                              setError(null)
                            }}
                            disabled={isSubmitting}
                            startIcon={<i className='tabler-x' />}
                            sx={{
                              minWidth: 100,
                              height: 36,
                              textTransform: 'none',
                              borderColor: 'divider',
                              color: 'text.secondary',
                              '&:hover': {
                                borderColor: 'text.secondary',
                                bgcolor: 'action.hover'
                              },
                              '&.Mui-disabled': {
                                borderColor: 'action.disabled',
                                color: 'action.disabled'
                              }
                            }}
                          >
                            {t('services.cancel')}
                          </Button>
                          <Button
                            variant='contained'
                            onClick={() => {
                              if (editingService) {
                                handleSaveService(editingService)
                              }
                            }}
                            disabled={isSubmitting || !editingService}
                            startIcon={<i className='tabler-device-floppy' />}
                            sx={{
                              minWidth: 100,
                              height: 36,
                              textTransform: 'none',
                              bgcolor: 'success.main',
                              '&:hover': {
                                bgcolor: 'success.dark'
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground',
                                color: 'action.disabled'
                              }
                            }}
                          >
                            {t('services.save')}
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                <Grid container spacing={3}>
                  {paginatedServices.map(service => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Card
                        sx={{
                          height: '100%',
                          transition: 'all 0.2s ease-in-out',
                          position: 'relative',
                          overflow: 'visible',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme => theme.shadows[8]
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          {editingService?.id === service.id && editingService ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {!service.code ? (
                                <>
                                  <TextField
                                    fullWidth
                                    required
                                    label={t('services.name')}
                                    value={editingService.name}
                                    onChange={e => {
                                      if (!editingService) return
                                      setEditingService({ ...editingService, name: e.target.value })
                                    }}
                                    error={error?.includes('name')}
                                    helperText={error?.includes('name') ? error : ''}
                                    size='small'
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position='start'>
                                          <i className='tabler-tag' />
                                        </InputAdornment>
                                      )
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: theme => theme.palette.background.paper
                                      }
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={1}
                                    label={t('services.description')}
                                    value={editingService.description}
                                    onChange={e => {
                                      if (!editingService) return
                                      setEditingService({ ...editingService, description: e.target.value })
                                    }}
                                    size='small'
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position='start'>
                                          <i className='tabler-file-description' />
                                        </InputAdornment>
                                      )
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: theme => theme.palette.background.paper
                                      }
                                    }}
                                  />
                                </>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant='subtitle1' sx={{ flex: 1, fontWeight: 600 }}>
                                    {service.name}
                                  </Typography>
                                  <Chip
                                    size='small'
                                    label={service.code}
                                    color='primary'
                                    variant='outlined'
                                    sx={{
                                      mr: 2,
                                      height: 24,
                                      '& .MuiChip-label': {
                                        px: 1.5,
                                        fontWeight: 500
                                      }
                                    }}
                                  />
                                </Box>
                              )}
                              <TextField
                                fullWidth
                                type='number'
                                label={t('services.amount')}
                                value={editingService?.amount ?? 0}
                                onChange={e => {
                                  const value = Number(e.target.value)

                                  if (value > 0 && editingService) {
                                    setEditingService({
                                      ...editingService,
                                      amount: value
                                    })
                                  }
                                }}
                                size='small'
                                inputProps={{
                                  min: 0.01,
                                  step: 0.01
                                }}
                                InputProps={{
                                  endAdornment: <InputAdornment position='end'>MAD</InputAdornment>
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: theme => theme.palette.background.paper,
                                    '& .MuiInputBase-input': {
                                      fontWeight: 600,
                                      color: 'primary.main',
                                      fontSize: '1rem'
                                    }
                                  }
                                }}
                              />
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  p: 1.5,
                                  borderRadius: 1,
                                  bgcolor: theme => theme.palette.action.hover
                                }}
                              >
                                <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                  {t('services.isActive')}
                                </Typography>
                                <Switch
                                  checked={editingService.is_active}
                                  onChange={e => {
                                    if (!editingService) return
                                    setEditingService({ ...editingService, is_active: e.target.checked })
                                  }}
                                  color='success'
                                  size='small'
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                  variant='outlined'
                                  onClick={() => {
                                    setEditingService(null)
                                    setError(null)
                                  }}
                                  disabled={isSubmitting}
                                  startIcon={<i className='tabler-x' />}
                                  size='small'
                                  sx={{
                                    minWidth: 90,
                                    height: 32,
                                    textTransform: 'none',
                                    borderColor: 'divider',
                                    color: 'text.secondary',
                                    '&:hover': {
                                      borderColor: 'text.secondary',
                                      bgcolor: 'action.hover'
                                    },
                                    '&.Mui-disabled': {
                                      borderColor: 'action.disabled',
                                      color: 'action.disabled'
                                    }
                                  }}
                                >
                                  {t('services.cancel')}
                                </Button>
                                <Button
                                  variant='contained'
                                  onClick={() => {
                                    if (editingService) {
                                      handleSaveService(editingService)
                                    }
                                  }}
                                  disabled={isSubmitting || !editingService}
                                  startIcon={<i className='tabler-device-floppy' />}
                                  size='small'
                                  sx={{
                                    minWidth: 90,
                                    height: 32,
                                    textTransform: 'none',
                                    bgcolor: 'success.main',
                                    '&:hover': {
                                      bgcolor: 'success.dark'
                                    },
                                    '&.Mui-disabled': {
                                      bgcolor: 'action.disabledBackground',
                                      color: 'action.disabled'
                                    }
                                  }}
                                >
                                  {t('services.save')}
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  mb: 2
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant='subtitle1'
                                    sx={{
                                      mb: 0.5,
                                      fontWeight: 600,
                                      color: theme => theme.palette.text.primary
                                    }}
                                  >
                                    {service.name}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip
                                      size='small'
                                      label={service.code}
                                      color='primary'
                                      variant='outlined'
                                      sx={{
                                        height: 24,
                                        '& .MuiChip-label': {
                                          px: 1.5,
                                          fontWeight: 500
                                        }
                                      }}
                                    />
                                    <Chip
                                      size='small'
                                      label={
                                        service.is_active ? t('services.status.active') : t('services.status.inactive')
                                      }
                                      color={service.is_active ? 'success' : 'default'}
                                      sx={{
                                        height: 24,
                                        '& .MuiChip-label': {
                                          px: 1.5,
                                          fontWeight: 500
                                        }
                                      }}
                                    />
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title={t('common.edit')}>
                                    <IconButton
                                      size='small'
                                      onClick={() => handleEditService(service)}
                                      disabled={isSubmitting}
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        color: 'text.secondary',
                                        '&:hover': {
                                          bgcolor: 'primary.main',
                                          borderColor: 'primary.main',
                                          color: 'white'
                                        },
                                        '&.Mui-disabled': {
                                          bgcolor: 'action.disabledBackground',
                                          borderColor: 'action.disabled',
                                          color: 'action.disabled'
                                        }
                                      }}
                                    >
                                      <i className='tabler-edit' style={{ fontSize: '0.875rem' }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('common.delete')}>
                                    <IconButton
                                      size='small'
                                      onClick={() => service.id && handleDeleteService(service.id)}
                                      disabled={isSubmitting}
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        color: 'text.secondary',
                                        '&:hover': {
                                          bgcolor: 'error.main',
                                          borderColor: 'error.main',
                                          color: 'white'
                                        },
                                        '&.Mui-disabled': {
                                          bgcolor: 'action.disabledBackground',
                                          borderColor: 'action.disabled',
                                          color: 'action.disabled'
                                        }
                                      }}
                                    >
                                      <i className='tabler-trash' style={{ fontSize: '0.875rem' }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              <Typography
                                color='text.secondary'
                                sx={{
                                  mb: 2,
                                  minHeight: 36,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.4
                                }}
                              >
                                {service.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  px: 2,
                                  py: 0.75,
                                  bgcolor: 'background.paper',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  boxShadow: 1
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    color: '#2e7d32',
                                    fontSize: '0.875rem',
                                    lineHeight: 1
                                  }}
                                >
                                  {(service.amount || 0).toLocaleString('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}{' '}
                                  MAD
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 6 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      color='primary'
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}

                {/* No Results */}
                {paginatedServices.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography color='text.secondary'>
                      {searchQuery || statusFilter !== 'all' ? t('services.noResults') : t('services.noServices')}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </PerfectScrollbar>
      </Box>
    </Drawer>
  )
}

export default ServicesDrawer
