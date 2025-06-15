import { z } from 'zod'
import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'
import {
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_TYPE_OPTIONS
} from '@/app/[lang]/(dashboard)/(private)/apps/appointments/constants'

function getTodayRange() {
  const now = new Date()

  // Use local timezone
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  return { start, end }
}

function getWeekRange() {
  const now = new Date()

  // Get the day of week (0=Sunday, 1=Monday, ...)
  const day = now.getDay()

  // Calculate how many days to subtract to get to Monday of the current week
  const diffToMonday = (day === 0 ? -6 : 1) - day

  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0)

  const saturday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 5, 23, 59, 59, 999)

  return { start: monday, end: saturday }
}

export async function getAppointments({
  page = 1,
  pageSize = 10,
  filter,
  status,
  type,
  startDate,
  endDate
}: {
  page?: number
  pageSize?: number
  filter?: string
  status?: string
  type?: string
  startDate?: string
  endDate?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organisationId) {
    throw new Error('User not authenticated or no organization assigned')
  }

  const organisationId = parseInt(session.user.organisationId)
  const skip = (page - 1) * pageSize

  const where: any = {
    organisation_id: organisationId
  }

  const dateWhere: any = {
    organisation_id: organisationId
  }

  if (filter === 'today') {
    const { start, end } = getTodayRange()

    where.appointment_date = { gte: start, lte: end }
    dateWhere.appointment_date = { gte: start, lte: end }
  } else if (filter === 'week') {
    const { start, end } = getWeekRange()

    where.appointment_date = { gte: start, lte: end }
    dateWhere.appointment_date = { gte: start, lte: end }
  } else if (startDate && endDate) {
    // Handle custom date range
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Set end date to end of day
    end.setHours(23, 59, 59, 999)

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
        doctor: true,
        patient_visits: {
          select: {
            id: true,
            status: true
          },
          take: 1,
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    }),
    prisma.patient_appointment.count({ where })
  ])

  // Map to table-friendly format
  const mappedAppointments = appointments.map(appt => ({
    id: appt.id,
    patientName: appt.patient?.name || '',
    appointmentDate: appt.appointment_date.toISOString(),
    type: appt.appointment_type || '',
    status: appt.status || '',
    doctorName: appt.doctor?.name || '',
    visit: appt.patient_visits[0] || undefined
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

/**
 * Get available appointment slots for an organisation for the next 7 days.
 * Returns an array of { date: 'YYYY-MM-DD', slots: ['09:00', '09:30', ...] }
 * Excludes slots already booked in patient_appointment for any doctor in the organisation.
 */
export async function getOrganisationAvailability(organisation_id: number, startDate?: string, endDate?: string) {
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-based in JS Date

    return date
  }

  // Use provided dates or default to current week
  const start = startDate ? parseLocalDate(startDate) : new Date()
  const end = endDate ? parseLocalDate(endDate) : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)

  // Set start to beginning of day and end to end of day
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  // Fetch organisation working hours
  const organisation = await prisma.organisation.findUnique({
    where: { id: organisation_id },
    select: {
      work_start_time: true,
      work_end_time: true,
      break_start_time: true,
      break_end_time: true,
      working_days: true
    }
  })

  if (!organisation) {
    throw new Error('Organisation not found')
  }

  // Parse working hours (these are in the organisation's local time)
  const [workStartHour, workStartMinute] = (organisation.work_start_time || '08:30').split(':').map(Number)
  const [workEndHour, workEndMinute] = (organisation.work_end_time || '18:00').split(':').map(Number)
  const [breakStartHour, breakStartMinute] = (organisation.break_start_time || '12:00').split(':').map(Number)
  const [breakEndHour, breakEndMinute] = (organisation.break_end_time || '13:30').split(':').map(Number)

  // Generate all slots for each day based on working hours
  const slotsPerDay: string[] = []
  const workingDays = organisation.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Generate slots from work start to work end, excluding break time
  for (let hour = workStartHour; hour <= workEndHour; hour++) {
    for (const minute of [0, 30]) {
      // Skip if we're before work start time
      if (hour === workStartHour && minute < workStartMinute) continue

      // Skip if we're after work end time
      if (hour === workEndHour && minute > workEndMinute) continue

      // Skip if we're in break time
      if (
        (hour > breakStartHour || (hour === breakStartHour && minute >= breakStartMinute)) &&
        (hour < breakEndHour || (hour === breakEndHour && minute <= breakEndMinute))
      )
        continue

      // Format the slot time (HH:mm)
      const slot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

      slotsPerDay.push(slot)
    }
  }

  // Get all appointments for the organisation in the range
  const appointments = await prisma.patient_appointment.findMany({
    where: {
      organisation_id: Number(organisation_id),
      appointment_date: {
        gte: start,
        lte: end
      },
      status: { not: 'cancelled' }
    },
    select: { appointment_date: true }
  })

  // Map booked slots: { 'YYYY-MM-DD': Set(['09:00', ...]) }
  const booked: Record<string, Set<string>> = {}

  appointments.forEach(appt => {
    const date = appt.appointment_date.toLocaleDateString('en-CA') // Use local date string

    // Convert appointment time to local time (HH:mm)
    const appointmentDate = new Date(appt.appointment_date)
    const time = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`

    if (!booked[date]) booked[date] = new Set()
    if (time) booked[date].add(time)
  })

  // Build availability
  const days: { date: string; slots: string[] }[] = []

  // Create a new date object to avoid modifying the original
  const currentDate = new Date(start)
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  while (currentDate <= end) {
    // Check if the day is a working day
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    const currentDateCopy = new Date(currentDate)

    currentDateCopy.setHours(0, 0, 0, 0)

    // Only process if it's a working day and not in the past
    if (workingDays.includes(dayName) && currentDateCopy >= today) {
      const dateStr = currentDate.toLocaleDateString('en-CA') // Use local date string
      const availableSlots: string[] = []

      // For each slot, check if it's available
      for (const slot of slotsPerDay) {
        // Check if this slot is booked
        const isBooked = booked[dateStr]?.has(slot) || false

        // For today, also check if the slot is in the past
        if (dateStr === today.toLocaleDateString('en-CA')) {
          const [slotHour, slotMinute] = slot.split(':').map(Number)
          const now = new Date()

          if (now.getHours() > slotHour || (now.getHours() === slotHour && now.getMinutes() >= slotMinute)) {
            continue // Skip past slots
          }
        }

        if (!isBooked) {
          availableSlots.push(slot)
        }
      }

      if (availableSlots.length > 0) {
        days.push({ date: dateStr, slots: availableSlots })
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}
