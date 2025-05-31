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
import IconButton from '@mui/material/IconButton'

import { useSession } from 'next-auth/react'

import { useTranslation } from '@/contexts/translationContext'

import MedicationDrawer from '@/app/[lang]/(dashboard)/(private)/apps/medications/list/MedicationDrawer'

interface Medication {
  id: number
  name: string
  category: string | null
  dosages: string[]
  organisation_id: number | null
}

type OrganizationFilter = 'all' | 'myOrg' | 'global'

export default function MedicationList() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [organizationFilter, setOrganizationFilter] = useState<OrganizationFilter>('all')

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const isAdmin = session?.user?.role === 'ADMIN'
  const userOrgId = Number(session?.user?.organisationId)

  const fetchMedications = async () => {
    try {
      const response = await fetch('/api/medications')

      if (!response.ok) {
        throw new Error('Failed to fetch medications')
      }

      const data = await response.json()

      // Filter medications to show only:
      // 1. Medications from user's organization
      // 2. Medications not linked to any organization (NULL organisation_id)
      const filteredMedications = data.filter(
        (med: Medication) => med.organisation_id === userOrgId || med.organisation_id === null
      )

      setMedications(filteredMedications)
    } catch (error) {
      console.error('Error fetching medications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [isAdmin, userOrgId])

  // Get unique categories from medications
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()

    medications.forEach(med => {
      if (med.category) uniqueCategories.add(med.category)
    })

    return Array.from(uniqueCategories).sort()
  }, [medications])

  // Filter medications based on search query, category, and organization
  const filteredMedications = useMemo(() => {
    return medications.filter(medication => {
      // Search query filter
      const matchesSearch = medication.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = !categoryFilter || medication.category === categoryFilter

      // Organization filter
      let matchesOrganization = true

      switch (organizationFilter) {
        case 'myOrg':
          matchesOrganization = medication.organisation_id === userOrgId
          break
        case 'global':
          matchesOrganization = medication.organisation_id === null
          break

        // 'all' case is handled by default matchesOrganization = true
      }

      return matchesSearch && matchesCategory && matchesOrganization
    })
  }, [medications, searchQuery, categoryFilter, organizationFilter, userOrgId])

  // Pagination
  const paginatedMedications = useMemo(() => {
    const start = page * rowsPerPage
    const end = start + rowsPerPage

    return filteredMedications.slice(start, end)
  }, [filteredMedications, page, rowsPerPage])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEdit = (medication: Medication) => {
    // Only allow editing if medication belongs to user's organization
    if (medication.organisation_id !== userOrgId) {
      alert(t('unauthorizedEditMedication') || 'You can only edit medications from your organization')

      return
    }

    setSelectedMedication(medication)
    setDrawerOpen(true)
  }

  const handleDelete = async (id: number) => {
    // Find the medication to check organization
    const medication = medications.find(med => med.id === id)

    if (!medication) return

    // Only allow deletion if medication belongs to user's organization
    if (medication.organisation_id !== userOrgId) {
      alert(t('unauthorizedDeleteMedication') || 'You can only delete medications from your organization')

      return
    }

    if (!confirm(t('confirmation.deleteMedication') || 'Are you sure you want to delete this medication?')) {
      return
    }

    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete medication')
      }

      fetchMedications()
    } catch (error) {
      console.error('Error deleting medication:', error)
      alert(t('errorDeletingMedication') || 'Error deleting medication')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('')
    setOrganizationFilter('all')
    setPage(0)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h5'>{t('medications.title')}</Typography>
              <Button
                variant='contained'
                onClick={() => {
                  setSelectedMedication(null)
                  setDrawerOpen(true)
                }}
                startIcon={<i className='tabler-plus' />}
              >
                {t('medications.addMedication')}
              </Button>
            </Box>

            {/* Filters Section */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size='small'
                placeholder={t('medications.filters.searchPlaceholder')}
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
                <InputLabel>{t('medications.filters.categoryLabel')}</InputLabel>
                <Select
                  value={categoryFilter}
                  label={t('medications.filters.categoryLabel')}
                  onChange={e => {
                    setCategoryFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <MenuItem value=''>{t('medications.filters.showAll')}</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size='small' sx={{ minWidth: 200 }}>
                <InputLabel>{t('medications.filters.organizationLabel')}</InputLabel>
                <Select
                  value={organizationFilter}
                  label={t('medications.filters.organizationLabel')}
                  onChange={e => {
                    setOrganizationFilter(e.target.value as OrganizationFilter)
                    setPage(0)
                  }}
                >
                  <MenuItem value='all'>{t('medications.filters.showAll')}</MenuItem>
                  <MenuItem value='myOrg'>{t('medications.filters.showMyOrg')}</MenuItem>
                  <MenuItem value='global'>{t('medications.filters.showGlobal')}</MenuItem>
                </Select>
              </FormControl>

              {(searchQuery || categoryFilter || organizationFilter !== 'all') && (
                <Button variant='outlined' onClick={clearFilters} startIcon={<i className='tabler-filter-off' />}>
                  {t('clearFilters')}
                </Button>
              )}
            </Box>

            <TableContainer component={Paper}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('medications.medicationName')}</TableCell>
                        <TableCell>{t('medications.category')}</TableCell>
                        <TableCell>{t('medications.dosages')}</TableCell>
                        <TableCell>{t('organization')}</TableCell>
                        <TableCell>{t('actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedMedications.map(medication => (
                        <TableRow key={medication.id}>
                          <TableCell>{medication.name}</TableCell>
                          <TableCell>{medication.category || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {medication.dosages.map((dosage, index) => (
                                <Typography
                                  key={index}
                                  variant='body2'
                                  sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}
                                >
                                  {dosage}
                                </Typography>
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {medication.organisation_id === null
                              ? t('global')
                              : medication.organisation_id === userOrgId
                                ? t('yourOrganization')
                                : t('otherOrganization')}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {medication.organisation_id === userOrgId && (
                                <>
                                  <Button
                                    variant='outlined'
                                    size='small'
                                    onClick={() => handleEdit(medication)}
                                    startIcon={<i className='tabler-edit' />}
                                  >
                                    {t('medications.edit')}
                                  </Button>
                                  <Button
                                    variant='outlined'
                                    color='error'
                                    size='small'
                                    onClick={() => handleDelete(medication.id)}
                                    startIcon={<i className='tabler-trash' />}
                                  >
                                    {t('medications.delete')}
                                  </Button>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {paginatedMedications.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align='center'>
                            {t('noResultsFound')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component='div'
                    count={filteredMedications.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage={t('medications.pagination.itemsPerPage')}
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} ${t('medications.pagination.of')} ${count}`
                    }
                  />
                </>
              )}
            </TableContainer>
          </Box>
        </Card>
      </Grid>

      <MedicationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        medication={selectedMedication}
        onSuccess={fetchMedications}
      />
    </Grid>
  )
}
