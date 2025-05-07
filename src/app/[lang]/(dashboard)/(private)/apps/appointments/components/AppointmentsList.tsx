// AppointmentsList component

import React from 'react'

import type { patient_visit } from '@prisma/client'

import Grid from '@mui/material/Grid'

import AppointmentListCards from './AppointmentListCards'
import AppointmentListTable from './AppointmentListTable'
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_TYPE_OPTIONS } from '../constants'
import { getAllDoctors } from '@/app/server/doctorActions'
import { getAllPatients } from '@/app/server/patientActions'

interface AppointmentsListProps {
  appointmentData: any[]
  page: number
  pageSize: number
  total: number
  dictionary: any
  visitsByAppointmentId?: Record<number, patient_visit>
}

const AppointmentsList = async ({
  appointmentData,
  page,
  pageSize,
  total,
  dictionary,
  visitsByAppointmentId = {}
}: AppointmentsListProps) => {
  const doctors = (await getAllDoctors()).map(d => ({ ...d, id: String(d.id) }))
  const patients = (await getAllPatients()).map(p => ({ ...p, id: String(p.id) }))

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
          statusOptions={APPOINTMENT_STATUS_OPTIONS}
          typeOptions={APPOINTMENT_TYPE_OPTIONS}
          doctors={doctors}
          patients={patients}
          dictionary={dictionary}
          visitsByAppointmentId={visitsByAppointmentId}
        />
      </Grid>
    </Grid>
  )
}

export default AppointmentsList
