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
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'

import { useTranslation, TranslationProvider } from '@/contexts/translationContext'
import AddAppointmentDrawer from './AddAppointmentDrawer'
import { LocalDate, LocalTime } from '@/components/LocalTime'
import VisitActionButton from './VisitActionButton'
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
  Scheduled: 'info',
  Confirmed: 'success',
  Pending: 'warning',
  Cancelled: 'error'
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
  const t = useTranslation()
  const [addOpen, setAddOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    if (newFilter) {
      params.set('filter', newFilter)
    } else {
      params.delete('filter')
    }

    params.set('page', '1') // Reset to first page on filter change
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

  const handleCancelClick = (appointmentId: number) => {
    setAppointmentToCancel(appointmentId)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return

    setIsCancelling(true)

    try {
      const res = await fetch(`/api/appointments/${appointmentToCancel}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      })

      if (res.ok) {
        router.refresh()
      } else {
        console.error('Failed to cancel appointment')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setIsCancelling(false)
      setCancelDialogOpen(false)
      setAppointmentToCancel(null)
    }
  }

  const handleCancelClose = () => {
    setCancelDialogOpen(false)
    setAppointmentToCancel(null)
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
      <div className='mb-4 flex flex-wrap items-center justify-between px-6 gap-2'>
        {/* Left side: Status/Type filters */}
        <div className='flex gap-2 order-1'>
          <FormControl size='small' sx={{ minWidth: 160, maxWidth: 220, width: '100%', mr: 2 }}>
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
          <FormControl size='small' sx={{ minWidth: 160, maxWidth: 220, width: '100%', mr: 2 }}>
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
        </div>
        {/* Right side: Today/This Week buttons */}
        <div className='flex gap-2 order-2'>
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
                  <Button variant='text' onClick={() => router.push(`/fr/apps/appointments/details?id=${row.id}`)}>
                    View Details
                  </Button>
                  {!visitsByAppointmentId[row.id] && row.status === 'scheduled' && (
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      className='ml-2'
                      onClick={() => handleCancelClick(row.id)}
                    >
                      {t.cancelAppointment || 'Cancel Appointment'}
                    </Button>
                  )}
                  <IconButton>
                    <i className='tabler-trash text-textSecondary' />
                  </IconButton>
                  <VisitActionButton appointmentId={row.id} visit={visitsByAppointmentId[row.id]} t={t} lang={lang} />
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
      <Dialog open={cancelDialogOpen} onClose={handleCancelClose}>
        <DialogTitle>{t.confirmCancellation || 'Confirm Cancellation'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.cancelAppointmentConfirmation || 'Are you sure you want to cancel this appointment?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} disabled={isCancelling}>
            {t.common?.cancel || 'Cancel'}
          </Button>
          <Button onClick={handleCancelConfirm} color='error' disabled={isCancelling}>
            {isCancelling ? t.loading || 'Loading...' : t.confirm || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default AppointmentListTable
