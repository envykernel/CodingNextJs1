'use client'

import { useState, useEffect, useMemo } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'

import DoctorDrawer from './DoctorDrawer'

interface Doctor {
  id: number
  name: string
  specialty: string | null
  phone_number: string | null
  email: string | null
  status: string
  organisation_id: number
}

// Add this before the DoctorList component
const doctorStatusObj = {
  enabled: {
    color: 'success' as const,
    icon: 'tabler-check'
  },
  disabled: {
    color: 'error' as const,
    icon: 'tabler-x'
  }
}

export default function DoctorList() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState<number | null>(null)

  const isAdmin = session?.user?.role === 'ADMIN'
  const isCabinetManager = session?.user?.role === 'CABINET_MANAGER'
  const canManageDoctors = isAdmin || isCabinetManager
  const userOrgId = Number(session?.user?.organisationId)

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')

      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }

      const data = await response.json()

      // Filter doctors to show only those from user's organization
      const filteredDoctors = data.filter((doc: Doctor) => doc.organisation_id === userOrgId)

      setDoctors(filteredDoctors)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canManageDoctors) {
      fetchDoctors()
    }
  }, [canManageDoctors, userOrgId])

  // Get unique specialties from doctors
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>()

    doctors.forEach(doc => {
      if (doc.specialty) uniqueSpecialties.add(doc.specialty)
    })

    return Array.from(uniqueSpecialties).sort()
  }, [doctors])

  // Filter doctors based on search query, specialty, and status
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      // Search query filter
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.email && doctor.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doctor.phone_number && doctor.phone_number.toLowerCase().includes(searchQuery.toLowerCase()))

      // Specialty filter
      const matchesSpecialty = !specialtyFilter || doctor.specialty === specialtyFilter

      // Status filter
      const matchesStatus = !statusFilter || doctor.status === statusFilter

      return matchesSearch && matchesSpecialty && matchesStatus
    })
  }, [doctors, searchQuery, specialtyFilter, statusFilter])

  // Pagination
  const paginatedDoctors = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage

    return filteredDoctors.slice(start, end)
  }, [filteredDoctors, page, rowsPerPage])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDrawerOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setDoctorToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return

    try {
      const response = await fetch(`/api/doctors/${doctorToDelete}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete doctor')
      }

      fetchDoctors()
    } catch (error) {
      console.error('Error deleting doctor:', error)
      alert(t('errorDeletingDoctor') || 'Error deleting doctor')
    } finally {
      setDeleteDialogOpen(false)
      setDoctorToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setDoctorToDelete(null)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSpecialtyFilter('')
    setStatusFilter('')
    setPage(0)
  }

  if (!canManageDoctors) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <Typography variant='h5' color='error'>
                {t('doctors.accessDenied')}
              </Typography>
              <Typography variant='body1'>{t('doctors.accessDeniedMessage')}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h5'>{t('doctors.title')}</Typography>
              {canManageDoctors && (
                <Button
                  variant='contained'
                  onClick={() => {
                    setSelectedDoctor(null)
                    setDrawerOpen(true)
                  }}
                  startIcon={<i className='tabler-plus' />}
                >
                  {t('doctors.addDoctor')}
                </Button>
              )}
            </Box>

            {/* Filters Section */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size='small'
                placeholder={t('doctors.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setPage(0)
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 200 }}
              />

              <FormControl size='small' sx={{ minWidth: 200 }}>
                <InputLabel>{t('doctors.filters.specialtyLabel')}</InputLabel>
                <Select
                  value={specialtyFilter}
                  label={t('doctors.filters.specialtyLabel')}
                  onChange={e => {
                    setSpecialtyFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <MenuItem value=''>{t('doctors.filters.allSpecialties')}</MenuItem>
                  {specialties.map(specialty => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size='small' sx={{ minWidth: 200 }}>
                <InputLabel>{t('doctors.filters.statusLabel')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('doctors.filters.statusLabel')}
                  onChange={e => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <MenuItem value=''>{t('doctors.filters.allStatuses')}</MenuItem>
                  <MenuItem value='enabled'>{t('doctors.status.enabled')}</MenuItem>
                  <MenuItem value='disabled'>{t('doctors.status.disabled')}</MenuItem>
                </Select>
              </FormControl>

              <Button variant='outlined' onClick={clearFilters}>
                {t('doctors.filters.clearFilters')}
              </Button>
            </Box>

            {/* Table Section */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : filteredDoctors.length === 0 ? (
              <Alert severity='info'>{t('doctors.noDoctorsFound')}</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('doctors.table.name')}</TableCell>
                      <TableCell>{t('doctors.table.specialty')}</TableCell>
                      <TableCell>{t('doctors.table.email')}</TableCell>
                      <TableCell>{t('doctors.table.phone')}</TableCell>
                      <TableCell>{t('doctors.table.status')}</TableCell>
                      {canManageDoctors && <TableCell align='right'>{t('doctors.table.actions')}</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedDoctors.map(doctor => (
                      <TableRow key={doctor.id}>
                        <TableCell>{doctor.name}</TableCell>
                        <TableCell>{doctor.specialty || '-'}</TableCell>
                        <TableCell>{doctor.email || '-'}</TableCell>
                        <TableCell>{doctor.phone_number || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={t(`doctors.status.${doctor.status}`)}
                            color={doctorStatusObj[doctor.status as keyof typeof doctorStatusObj].color}
                            size='small'
                            variant='tonal'
                            icon={<i className={doctorStatusObj[doctor.status as keyof typeof doctorStatusObj].icon} />}
                            sx={{
                              '& .MuiChip-icon': {
                                fontSize: '1rem'
                              }
                            }}
                          />
                        </TableCell>
                        {canManageDoctors && (
                          <TableCell align='right'>
                            <Button
                              variant='outlined'
                              color='primary'
                              size='small'
                              onClick={() => handleEdit(doctor)}
                              sx={{ mr: 1 }}
                              startIcon={<i className='tabler-edit' />}
                            >
                              {t('doctors.actions.edit')}
                            </Button>
                            <Button
                              variant='outlined'
                              color='error'
                              size='small'
                              onClick={() => handleDeleteClick(doctor.id)}
                              startIcon={<i className='tabler-trash' />}
                            >
                              {t('doctors.actions.delete')}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component='div'
                  count={filteredDoctors.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </TableContainer>
            )}
          </Box>
        </Card>
      </Grid>

      {canManageDoctors && (
        <DoctorDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          doctor={selectedDoctor}
          onSave={fetchDoctors}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>{t('doctors.deleteConfirmation.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            {t('doctors.deleteConfirmation.message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='primary'>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
