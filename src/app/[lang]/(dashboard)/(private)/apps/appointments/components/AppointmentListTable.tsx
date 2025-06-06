'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation'

import {
  Card,
  Button,
  Chip,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Box,
  useTheme,
  Alert,
  Typography
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'

import { addDays, isAfter, isBefore } from 'date-fns'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'

import { useTranslation } from '@/contexts/translationContext'
import AddAppointmentDrawer from './AddAppointmentDrawer'
import { LocalDate, LocalTime } from '@/components/LocalTime'
import VisitActionButton from './VisitActionButton'
import CancelAppointmentButton from './CancelAppointmentButton'
import type { PatientType } from '@/views/apps/patient/list/PatientListTable'
import type { Locale } from '@configs/i18n'

interface AppointmentListTableProps {
  appointmentData: any[]
  page: number
  pageSize: number
  total: number
  statusOptions?: string[]
  typeOptions?: string[]
  doctors: { id: string | number; name: string }[]
  patients: PatientType[]
  dictionary: any
  visitsByAppointmentId?: Record<number, any>
  error?: {
    error: string
    message: string
    details?: string
  }
}

const statusColor: { [key: string]: string } = {
  scheduled: 'warning',
  completed: 'success',
  cancelled: 'error',
  in_progress: 'info'
}

const AppointmentListTable: React.FC<AppointmentListTableProps> = ({
  appointmentData,
  page,
  pageSize,
  total,
  statusOptions = [],
  typeOptions = [],
  doctors = [],
  patients = [],
  dictionary,
  visitsByAppointmentId = {},
  error
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams<{ lang: string }>()
  const lang = params?.lang as Locale
  const filter = searchParams?.get('filter') || ''
  const status = searchParams?.get('status') || ''
  const type = searchParams?.get('type') || ''
  const startDateParam = searchParams?.get('startDate') || ''
  const endDateParam = searchParams?.get('endDate') || ''
  const { t } = useTranslation()
  const [addOpen, setAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const theme = useTheme()

  // State for date pickers
  const [startDate, setStartDate] = useState<Date | null>(startDateParam ? new Date(startDateParam) : null)
  const [endDate, setEndDate] = useState<Date | null>(endDateParam ? new Date(endDateParam) : null)

  // Add error state
  const [errorState, setErrorState] = useState<{
    error: string
    message: string
    details?: string
  } | null>(error || null)

  // Add effect to reset loading state when data changes
  useEffect(() => {
    if (appointmentData) {
      setIsLoading(false)
    }
  }, [appointmentData])

  // Add a timeout to reset loading state as fallback
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false)
      }, 5000) // 5 second timeout as fallback
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading])

  // Helper function to handle navigation
  const handleNavigation = async (params: URLSearchParams) => {
    setIsLoading(true)

    try {
      await router.push(`${pathname}?${params.toString()}`)
      router.refresh()
    } catch (err) {
      setErrorState({
        error: 'appointments.errors.navigationFailed',
        message: 'appointments.errors.navigationFailedMessage'
      })
      setIsLoading(false)
    }
  }

  // Modify handlePageChange
  const handlePageChange = (_event: unknown, newPage: number) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    params.set('page', String(newPage + 1))

    handleNavigation(params)
  }

  // Modify handlePageSizeChange
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    const newPageSize = Number(event.target.value)

    params.set('pageSize', String(newPageSize))
    params.set('page', '1')

    handleNavigation(params)
  }

  // Modify other handlers to use handleNavigation
  const handleDateRangeChange = (newStartDate: Date | null, newEndDate: Date | null) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    // Clear the filter if we're using date range
    params.delete('filter')

    // If only start date is selected, set end date to the same date
    if (newStartDate && !newEndDate) {
      newEndDate = newStartDate
      setEndDate(newStartDate)
    }

    if (newStartDate && newEndDate) {
      params.set('startDate', newStartDate.toISOString().split('T')[0])
      params.set('endDate', newEndDate.toISOString().split('T')[0])
    } else {
      params.delete('startDate')
      params.delete('endDate')
    }

    params.set('page', '1')

    handleNavigation(params)
  }

  const handleFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    // Clear date range if using preset filters
    params.delete('startDate')
    params.delete('endDate')
    setStartDate(null)
    setEndDate(null)

    if (newFilter) {
      params.set('filter', newFilter)
    } else {
      params.delete('filter')
    }

    params.set('page', '1')
    handleNavigation(params)
  }

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    const value = event.target.value as string

    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }

    params.set('page', '1')
    handleNavigation(params)
  }

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')
    const value = event.target.value as string

    if (value) {
      params.set('type', value)
    } else {
      params.delete('type')
    }

    params.set('page', '1')
    handleNavigation(params)
  }

  const handleClearDateRange = () => {
    setStartDate(null)
    setEndDate(null)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    params.delete('startDate')
    params.delete('endDate')
    params.set('page', '1')
    handleNavigation(params)
  }

  const isAppointmentWithinLastWeek = (appointmentDate: string) => {
    const appointmentDateTime = new Date(appointmentDate)
    const oneWeekAgo = addDays(new Date(), -7)

    return isAfter(appointmentDateTime, oneWeekAgo) || isBefore(appointmentDateTime, new Date())
  }

  // Reset error state when data changes
  React.useEffect(() => {
    if (appointmentData) {
      setErrorState(null)
    }
  }, [appointmentData])

  // Helper function to map database appointment types to translation keys
  const mapAppointmentTypeToKey = (type: string) => {
    return type.toLowerCase().replace(/\s+/g, '_')
  }

  // Add this new helper function
  const getTypeOptionTranslationKey = (option: string) => {
    return mapAppointmentTypeToKey(option)
  }

  return (
    <Card>
      {errorState && (
        <Alert severity='error' sx={{ mb: 4 }} onClose={() => setErrorState(null)}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
            {t(errorState.error)}
          </Typography>
          <Typography variant='body2'>{t(errorState.message)}</Typography>
          {errorState.details && (
            <Typography variant='body2' sx={{ mt: 1 }}>
              {t(errorState.details)}
            </Typography>
          )}
        </Alert>
      )}
      <div className='flex items-center justify-between px-6 pt-6'>
        <span className='text-xl font-semibold'>{t('appointmentsList')}</span>
        <Button variant='contained' color='primary' onClick={() => setAddOpen(true)}>
          {t('createAppointment')}
        </Button>
      </div>
      <Divider className='my-4' />
      <div className='mb-4 flex flex-wrap items-center gap-4 px-6'>
        {/* Filters container */}
        <div className='flex flex-wrap items-center gap-4 flex-1'>
          {/* Status/Type filters */}
          <FormControl size='small' sx={{ minWidth: 160, maxWidth: 220, width: '100%' }}>
            <InputLabel shrink>{t('status')}</InputLabel>
            <Select value={status} label={t('status')} onChange={handleStatusChange} displayEmpty>
              <MenuItem value=''>{t('appointments.filters.all')}</MenuItem>
              {statusOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {t(`appointments.statusOptions.${option}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 160, maxWidth: 220, width: '100%' }}>
            <InputLabel shrink>{t('type')}</InputLabel>
            <Select value={type} label={t('type')} onChange={handleTypeChange} displayEmpty>
              <MenuItem value=''>{t('appointments.filters.all')}</MenuItem>
              {typeOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {t(`appointments.typeOptions.${getTypeOptionTranslationKey(option)}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className='flex items-center gap-2'>
            <AppReactDatepicker
              selected={startDate}
              onChange={(date: Date | null) => handleDateRangeChange(date, endDate)}
              selectsStart
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              placeholderText={t('appointments.filters.startDate')}
              customInput={<CustomTextField fullWidth size='small' />}
            />
            <AppReactDatepicker
              selected={endDate}
              onChange={(date: Date | null) => handleDateRangeChange(startDate, date)}
              selectsEnd
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              minDate={startDate || undefined}
              placeholderText={t('appointments.filters.endDate')}
              customInput={<CustomTextField fullWidth size='small' />}
            />
            {(startDate || endDate) && (
              <IconButton onClick={handleClearDateRange} size='small'>
                <i className='tabler-x' />
              </IconButton>
            )}
          </div>
        </div>

        {/* Today/This Week buttons */}
        <div className='flex gap-2'>
          <Button
            variant={filter === 'today' ? 'contained' : 'outlined'}
            color={filter === 'today' ? 'primary' : 'inherit'}
            onClick={() => handleFilter(filter === 'today' ? '' : 'today')}
          >
            {t('appointmentStatistics.todayAppointments.subtitle')}
          </Button>
          <Button
            variant={filter === 'week' ? 'contained' : 'outlined'}
            color={filter === 'week' ? 'primary' : 'inherit'}
            onClick={() => handleFilter(filter === 'week' ? '' : 'week')}
          >
            {t('appointmentStatistics.dayStats.subtitle.week')}
          </Button>
        </div>
      </div>
      <Divider className='mb-2' />
      <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', position: 'relative' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('patient')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('date')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('time')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('type')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('status')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointmentData.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.patientName || t('appointments.unknownPatient')}</TableCell>
                <TableCell>
                  <LocalDate iso={row.appointmentDate} />
                </TableCell>
                <TableCell>
                  <LocalTime iso={row.appointmentDate} />
                </TableCell>
                <TableCell>
                  {row.type ? t(`appointments.typeOptions.${mapAppointmentTypeToKey(row.type)}`) : ''}
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(`appointmentStatistics.todayAppointments.status.${row.status}`)}
                    color={statusColor[row.status] as any}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => router.push(`/${lang}/apps/appointments/details?id=${row.id}`)}
                      startIcon={<i className='tabler-eye text-lg' />}
                    >
                      {t('appointments.actions.viewDetails')}
                    </Button>
                    {/* Show VisitActionButton if there's a linked visit */}
                    {visitsByAppointmentId[row.id] && (
                      <VisitActionButton
                        appointmentId={row.id}
                        visit={visitsByAppointmentId[row.id]}
                        lang={lang}
                        size='small'
                        variant='contained'
                        onVisitCreated={() => router.refresh()}
                      />
                    )}
                    {/* Show create visit button only for scheduled appointments within last week */}
                    {!visitsByAppointmentId[row.id] &&
                      row.status === 'scheduled' &&
                      isAppointmentWithinLastWeek(row.appointmentDate) && (
                        <VisitActionButton
                          appointmentId={row.id}
                          visit={undefined}
                          lang={lang}
                          size='small'
                          variant='contained'
                          onVisitCreated={() => router.refresh()}
                        />
                      )}
                    {row.status === 'scheduled' && isAppointmentWithinLastWeek(row.appointmentDate) && (
                      <CancelAppointmentButton
                        appointmentId={row.id}
                        size='small'
                        variant='outlined'
                        onAppointmentCancelled={() => router.refresh()}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(2px)',
              zIndex: 1,
              color: theme.palette.text.primary
            }}
          >
            <CircularProgress
              size={40}
              sx={{
                mb: 2,
                color: theme.palette.primary.main
              }}
            />
            <Box
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500
              }}
            >
              {t('loading')}
            </Box>
          </Box>
        )}
        {!isLoading && !errorState && appointmentData.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>{t('appointments.noAppointments')}</Typography>
          </Box>
        )}
      </TableContainer>
      <TablePagination
        component='div'
        count={total}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handlePageSizeChange}
        labelRowsPerPage={t('appointments.pagination.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('appointments.pagination.of')} ${count}`}
      />
      <AddAppointmentDrawer
        open={addOpen}
        handleClose={() => setAddOpen(false)}
        doctors={doctors}
        patients={patients}
        dictionary={dictionary}
        onAppointmentCreated={() => router.refresh()}
      />
    </Card>
  )
}

export default AppointmentListTable
