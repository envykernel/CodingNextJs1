// AppointmentsList component
'use client'

import React from 'react'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import Grid from '@mui/material/Grid'

import AppointmentListCards from './AppointmentListCards'
import AppointmentListTable from './AppointmentListTable'

interface AppointmentsListProps {
  appointmentData: any[]
  page: number
  pageSize: number
  total: number
  statusOptions?: string[]
  typeOptions?: string[]
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointmentData,
  page,
  pageSize,
  total,
  statusOptions,
  typeOptions
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (_: unknown, newPage: number) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    params.set('page', (newPage + 1).toString()) // TablePagination is 0-based
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '')

    params.set('pageSize', event.target.value)
    params.set('page', '1') // Reset to first page on pageSize change
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AppointmentListCards />
      </Grid>
      <Grid item xs={12}>
        <AppointmentListTable
          appointmentData={appointmentData}
          page={page - 1} // TablePagination expects 0-based page
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          statusOptions={statusOptions}
          typeOptions={typeOptions}
        />
      </Grid>
    </Grid>
  )
}

export default AppointmentsList
