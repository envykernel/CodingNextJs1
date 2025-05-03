import { prisma } from '@/prisma/prisma'

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
  const [appointments, total, statusOptions, typeOptions] = await Promise.all([
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
    prisma.patient_appointment.count({ where }),
    prisma.patient_appointment.findMany({
      where: dateWhere,
      select: { status: true },
      distinct: ['status']
    }),
    prisma.patient_appointment.findMany({
      where: dateWhere,
      select: { appointment_type: true },
      distinct: ['appointment_type']
    })
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

  return {
    appointments: mappedAppointments,
    page,
    pageSize,
    total,
    statusOptions: statusOptions.map(s => s.status).filter(Boolean),
    typeOptions: typeOptions.map(t => t.appointment_type).filter(Boolean)
  }
}
