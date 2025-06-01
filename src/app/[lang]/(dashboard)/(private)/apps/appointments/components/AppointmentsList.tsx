// AppointmentsList component

import React from 'react'

import Grid from '@mui/material/Grid'

import type { patient_visit } from '@prisma/client'

import AppointmentListCards from './AppointmentListCards'
import AppointmentListTable from './AppointmentListTable'
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_TYPE_OPTIONS } from '../constants'
import { getAllDoctors } from '@/app/server/doctorActions'
import { getAllPatients } from '@/app/server/patientActions'
import { TranslationProvider } from '@/contexts/translationContext'

interface AppointmentsListProps {
  appointmentData: any[]
  page: number
  pageSize: number
  total: number
  dictionary: any
  visitsByAppointmentId?: Record<number, patient_visit>
  error?: {
    error: string
    message: string
    details?: string
  }
}

const AppointmentsList = async ({
  appointmentData,
  page,
  pageSize,
  total,
  dictionary,
  visitsByAppointmentId = {},
  error
}: AppointmentsListProps) => {
  const doctors = (await getAllDoctors()).map(d => ({ ...d, id: String(d.id) }))

  const patients = (await getAllPatients()).map(p => ({
    id: p.id,
    name: p.name,
    birthdate: p.birthdate || new Date(),
    gender: p.gender || 'unknown'
  }))

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TranslationProvider dictionary={dictionary}>
          <AppointmentListCards />
        </TranslationProvider>
      </Grid>
      <Grid item xs={12}>
        <TranslationProvider dictionary={dictionary}>
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
            error={error}
          />
        </TranslationProvider>
      </Grid>
    </Grid>
  )
}

export default AppointmentsList
