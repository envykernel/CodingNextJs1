'use client'

import React, { useState } from 'react'

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
  IconButton
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'

import { useTranslation, TranslationProvider } from '@/contexts/translationContext'
import AddAppointmentDrawer from './AddAppointmentDrawer'
import { LocalDate, LocalTime } from '@/components/LocalTime'
import VisitActionButton from './VisitActionButton'
import CancelAppointmentButton from './CancelAppointmentButton'
import type { PatientType } from '@/views/apps/patient/list/PatientListTable'

interface AppointmentListTableProps {
  appointmentData: any[]
  page: number
  pageSize: number
  total: number
  onPageChange?: (event: unknown, newPage: number) => void
  onPageSizeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  statusOptions?: string[]
  typeOptions?: string[]
  doctors: { id: string | number; name: string }[]
  patients: PatientType[]
  dictionary: any
  visitsByAppointmentId?: Record<number, any>
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
  onPageChange = () => {},
  onPageSizeChange = () => {},
  statusOptions = [],
  typeOptions = [],
  doctors = [],
  patients = [],
  dictionary,
  visitsByAppointmentId = {}
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const filter = searchParams?.get('filter') || ''
  const status = searchParams?.get('status') || ''
  const type = searchParams?.get('type') || ''
  const startDateParam = searchParams?.get('startDate') || ''
  const endDateParam = searchParams?.get('endDate') || ''
  const t = useTranslation()
  const [addOpen, setAddOpen] = useState(false)

  // State for date pickers
  const [startDate, setStartDate] = useState<Date | null>(startDateParam ? new Date(startDateParam) : null)
  const [endDate, setEndDate] = useState<Date | null>(endDateParam ? new Date(endDateParam) : null)

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

    params.set('page', '1') // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
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
    router.push(`${pathname}?${params.toString()}`)
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
    router.push(`${pathname}?${params.toString()}`)
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
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearDateRange = () => {
    setStartDate(null)
    setEndDate(null)
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    params.delete('startDate')
    params.delete('endDate')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Card>
      <div className='flex items-center justify-between px-6 pt-6'>
        <span className='text-xl font-semibold'>
          {t.appointmentsList || t.appointments?.appointmentsList || 'Appointments List'}
        </span>
        <Button variant='contained' color='primary' onClick={() => setAddOpen(true)}>
          {t.createAppointment || t.appointments?.createAppointment || 'Create New Appointment'}
        </Button>
      </div>
      <Divider className='my-4' />
      <div className='mb-4 flex flex-wrap items-center gap-4 px-6'>
        {/* Filters container */}
        <div className='flex flex-wrap items-center gap-4 flex-1'>
          {/* Status/Type filters */}
          <FormControl size='small' sx={{ minWidth: 160, maxWidth: 220, width: '100%' }}>
            <InputLabel shrink>Status</InputLabel>
            <Select value={status} label='Status' onChange={handleStatusChange} displayEmpty>
              <MenuItem value=''>All Statuses</MenuItem>
              {statusOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 160, maxWidth: 220, width: '100%' }}>
            <InputLabel shrink>Type</InputLabel>
            <Select value={type} label='Type' onChange={handleTypeChange} displayEmpty>
              <MenuItem value=''>All Types</MenuItem>
              {typeOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
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
              placeholderText='Start Date'
              customInput={<CustomTextField fullWidth size='small' />}
            />
            <AppReactDatepicker
              selected={endDate}
              onChange={(date: Date | null) => handleDateRangeChange(startDate, date)}
              selectsEnd
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              minDate={startDate || undefined}
              placeholderText='End Date'
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
            Today
          </Button>
          <Button
            variant={filter === 'week' ? 'contained' : 'outlined'}
            color={filter === 'week' ? 'primary' : 'inherit'}
            onClick={() => handleFilter(filter === 'week' ? '' : 'week')}
          >
            This Week
          </Button>
        </div>
      </div>
      <Divider className='mb-2' />
      <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointmentData.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.patientName}</TableCell>
                <TableCell>
                  <LocalDate iso={row.appointmentDate} />
                </TableCell>
                <TableCell>
                  <LocalTime iso={row.appointmentDate} />
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    color={
                      (statusColor[row.status] as 'info' | 'success' | 'warning' | 'error' | 'default') || 'default'
                    }
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => router.push(`/fr/apps/appointments/details?id=${row.id}`)}
                      startIcon={<i className='tabler-eye text-lg' />}
                    >
                      {t.viewDetails || 'View Details'}
                    </Button>
                    {row.status === 'scheduled' && (
                      <>
                        <VisitActionButton
                          appointmentId={row.id}
                          visit={visitsByAppointmentId[row.id]}
                          t={t}
                          lang={lang}
                          size='small'
                          variant='contained'
                          onVisitCreated={() => router.refresh()}
                        />
                        <CancelAppointmentButton
                          appointmentId={row.id}
                          t={t}
                          size='small'
                          variant='outlined'
                          onAppointmentCancelled={() => router.refresh()}
                        />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={total}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={onPageSizeChange}
        rowsPerPageOptions={[10, 25, 50]}
      />
      <TranslationProvider dictionary={dictionary}>
        <AddAppointmentDrawer
          open={addOpen}
          handleClose={() => setAddOpen(false)}
          doctors={doctors}
          patients={patients}
          dictionary={dictionary}
          onAppointmentCreated={() => router.refresh()}
        />
      </TranslationProvider>
    </Card>
  )
}

export default AppointmentListTable
