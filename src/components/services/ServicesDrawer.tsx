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
  id: string
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

// Helper function to generate code from name
const generateCode = (name: string): string => {
  // Remove special characters and convert to uppercase
  const baseCode = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) // Limit to 8 characters

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4)

  return `${baseCode}-${timestamp}`
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

  const handleSaveService = async (service: Service) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: service.amount,
          is_active: service.is_active
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      // Update local state
      setServices(prevServices => prevServices.map(s => (s.id === service.id ? service : s)))
      setEditingService(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddService = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const newService: Omit<Service, 'id' | 'code'> = {
        name: '',
        description: '',
        amount: 0,
        is_active: true
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newService)
      })

      if (!response.ok) {
        throw new Error('Failed to create service')
      }

      const createdService = await response.json()

      setServices(prevServices => [...prevServices, createdService])
      setEditingService(createdService)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm(t('services.confirmDelete'))) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      setServices(prevServices => prevServices.filter(s => s.id !== serviceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
          width: { xs: '100%', sm: '50%' },
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
        <Box sx={{ p: 5, pb: 0 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
                    setPage(1) // Reset to first page on search
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
                    <InputLabel>{t('services.status')}</InputLabel>
                    <Select
                      value={statusFilter}
                      label={t('services.status')}
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

                        // Toggle sort order if clicking the same sort option
                        if (newSortBy === sortBy) {
                          setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
                        } else {
                          setSortBy(newSortBy)
                          setSortOrder('asc')
                        }

                        setPage(1)
                      }}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
                              setPage(1)
                            }}
                          >
                            <i className={`tabler-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`} />
                          </IconButton>
                        </InputAdornment>
                      }
                    >
                      <MenuItem value='name'>{t('services.sortByName')}</MenuItem>
                      <MenuItem value='amount'>{t('services.sortByAmount')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
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

            {/* Add New Service Button */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Button
                  fullWidth
                  variant='contained'
                  startIcon={<i className='tabler-plus' />}
                  onClick={handleAddService}
                  disabled={isSubmitting}
                >
                  {t('services.addNew')}
                </Button>
              </CardContent>
            </Card>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {paginatedServices.map(service => (
                    <Grid item xs={12} sm={6} key={service.id}>
                      <Card
                        sx={{
                          height: '100%',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme => theme.shadows[4]
                          }
                        }}
                      >
                        <CardContent>
                          {editingService?.id === service.id ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {!service.code ? (
                                <>
                                  <TextField
                                    fullWidth
                                    label={t('services.name')}
                                    value={editingService.name}
                                    onChange={e => {
                                      const newName = e.target.value

                                      setEditingService(
                                        prev =>
                                          prev && {
                                            ...prev,
                                            name: newName,
                                            code: generateCode(newName)
                                          }
                                      )
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position='start'>
                                          <i className='tabler-tag' />
                                        </InputAdornment>
                                      )
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label={t('services.description')}
                                    value={editingService.description}
                                    onChange={e =>
                                      setEditingService(prev => prev && { ...prev, description: e.target.value })
                                    }
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position='start'>
                                          <i className='tabler-file-description' />
                                        </InputAdornment>
                                      )
                                    }}
                                  />
                                </>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant='subtitle1' sx={{ flex: 1 }}>
                                    {service.name}
                                  </Typography>
                                  <Chip
                                    size='small'
                                    label={service.code}
                                    color='primary'
                                    variant='outlined'
                                    sx={{ mr: 2 }}
                                  />
                                </Box>
                              )}
                              <TextField
                                fullWidth
                                type='number'
                                label={t('services.amount')}
                                value={editingService.amount || 0}
                                onChange={e =>
                                  setEditingService(
                                    prev =>
                                      prev && {
                                        ...prev,
                                        amount: Number(e.target.value) || 0
                                      }
                                  )
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position='start'>
                                      <i className='tabler-currency-dollar' />
                                    </InputAdornment>
                                  ),
                                  endAdornment: <InputAdornment position='end'>EUR</InputAdornment>
                                }}
                                sx={{
                                  '& .MuiInputBase-input': {
                                    fontWeight: 600,
                                    color: 'primary.main'
                                  }
                                }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography>{t('services.isActive')}</Typography>
                                <Switch
                                  checked={editingService.is_active}
                                  onChange={e =>
                                    setEditingService(
                                      prev =>
                                        prev && {
                                          ...prev,
                                          is_active: e.target.checked
                                        }
                                    )
                                  }
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                  variant='outlined'
                                  onClick={() => setEditingService(null)}
                                  disabled={isSubmitting}
                                  startIcon={<i className='tabler-x' />}
                                >
                                  {t('services.cancel')}
                                </Button>
                                <Button
                                  variant='contained'
                                  onClick={() => handleSaveService(editingService)}
                                  disabled={isSubmitting}
                                  startIcon={<i className='tabler-device-floppy' />}
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
                                  <Typography variant='h6' sx={{ mb: 0.5 }}>
                                    {service.name}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip
                                      size='small'
                                      label={service.code}
                                      color='primary'
                                      variant='outlined'
                                      sx={{ height: 20 }}
                                    />
                                    <Chip
                                      size='small'
                                      label={
                                        service.is_active ? t('services.status.active') : t('services.status.inactive')
                                      }
                                      color={service.is_active ? 'success' : 'default'}
                                      sx={{ height: 20 }}
                                    />
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title={t('common.edit')}>
                                    <IconButton
                                      size='small'
                                      onClick={() => handleEditService(service)}
                                      disabled={isSubmitting}
                                      color='primary'
                                    >
                                      <i className='tabler-edit' />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('common.delete')}>
                                    <IconButton
                                      size='small'
                                      color='error'
                                      onClick={() => handleDeleteService(service.id)}
                                      disabled={isSubmitting}
                                    >
                                      <i className='tabler-trash' />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              <Typography color='text.secondary' sx={{ mb: 2 }}>
                                {service.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 3,
                                  p: 2,
                                  bgcolor: theme => theme.palette.action.hover,
                                  borderRadius: 1
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <i className='tabler-currency-dollar text-primary' />
                                  <Typography variant='h6' color='primary.main' sx={{ fontWeight: 600 }}>
                                    {(service.amount || 0).toLocaleString('fr-FR', {
                                      style: 'currency',
                                      currency: 'EUR',
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </Typography>
                                </Box>
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
