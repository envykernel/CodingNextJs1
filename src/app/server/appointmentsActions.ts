import { z } from 'zod'

import { prisma } from '@/prisma/prisma'
import {
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_TYPE_OPTIONS
} from '@/app/[lang]/(dashboard)/(private)/apps/appointments/constants'

function getTodayRange() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))

  return { start, end }
}

function getWeekRange() {
  const now = new Date()

  // Get the day of week (0=Sunday, 1=Monday, ...)
  const day = now.getUTCDay()

  // Calculate how many days to subtract to get to Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day

  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday, 0, 0, 0, 0)
  )

  const sunday = new Date(
    Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6, 23, 59, 59, 999)
  )

  return { start: monday, end: sunday }
}

export async function getAppointments({
  page = 1,
  pageSize = 10,
  filter,
  status,
  type
}: {
  page?: number
  pageSize?: number
  filter?: string
  status?: string
  type?: string
}) {
  const skip = (page - 1) * pageSize

  const where: any = {}
  const dateWhere: any = {}

  if (filter === 'today') {
    const { start, end } = getTodayRange()

    where.appointment_date = { gte: start, lte: end }
    dateWhere.appointment_date = { gte: start, lte: end }
  } else if (filter === 'week') {
    const { start, end } = getWeekRange()

    where.appointment_date = { gte: start, lte: end }
    dateWhere.appointment_date = { gte: start, lte: end }
  }

  if (status) {
    where.status = status
  }

  if (type) {
    where.appointment_type = type
  }

  // Fetch distinct status and type values, filtered by date if filter is set
  const [appointments, total] = await Promise.all([
    prisma.patient_appointment.findMany({
      skip,
      take: pageSize,
      orderBy: { appointment_date: 'desc' },
      where,
      include: {
        patient: true,
        doctor: true
      }
    }),
    prisma.patient_appointment.count({ where })
  ])

  // Map to table-friendly format
  const mappedAppointments = appointments.map(appt => ({
    id: appt.id,
    patientName: appt.patient?.name || '',
    date: appt.appointment_date.toISOString().split('T')[0],
    time: appt.appointment_date.toISOString().split('T')[1]?.slice(0, 5) || '',
    type: appt.appointment_type || '',
    status: appt.status || '',
    doctorName: appt.doctor?.name || ''
  }))

  // Static options
  const statusOptionsStatic = APPOINTMENT_STATUS_OPTIONS
  const typeOptionsStatic = APPOINTMENT_TYPE_OPTIONS

  return {
    appointments: mappedAppointments,
    page,
    pageSize,
    total,
    statusOptions: statusOptionsStatic,
    typeOptions: typeOptionsStatic
  }
}

export const appointmentCreateSchema = z.object({
  patient_id: z.string().min(1),
  doctor_id: z.string().min(1),
  appointment_date: z.string().min(1),
  appointment_type: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().optional()
})

export async function createAppointment(data: any) {
  const parsed = appointmentCreateSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Validation failed', details: parsed.error.flatten() }
  }

  try {
    const { patient_id, doctor_id, appointment_date, appointment_type, status, notes } = parsed.data

    // Fetch organisation_id from patient
    const patient = await prisma.patient.findUnique({
      where: { id: Number(patient_id) },
      select: { organisation_id: true }
    })

    if (!patient) {
      return { success: false, error: 'Patient not found' }
    }

    const appointmentData = {
      organisation_id: patient.organisation_id,
      patient_id: Number(patient_id),
      doctor_id: Number(doctor_id),
      appointment_date: new Date(appointment_date),
      appointment_type,
      status,
      notes
    }

    console.log('Creating appointment with data:', appointmentData)

    const appointment = await prisma.patient_appointment.create({
      data: appointmentData
    })

    return { success: true, appointment }
  } catch (error) {
    console.error('Create appointment error:', error)

    return {
      success: false,
      error: 'Database error',
      details: error instanceof Error ? error.message : JSON.stringify(error)
    }
  }
}
