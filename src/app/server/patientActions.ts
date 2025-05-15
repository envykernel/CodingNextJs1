// 'use server'

// Type Imports
// (Optional) import type { PatientType } from '@/views/apps/patient/list/PatientListTable'

import { z } from 'zod'

import { prisma } from '@/prisma/prisma'

const patientSchema = z.object({
  name: z.string().min(1),
  phone_number: z.string().min(1),
  gender: z.string().min(1),
  status: z.string().min(1),
  birthdate: z.string().min(1),
  doctor_id: z.number().optional(),
  avatar: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_email: z.string().optional()
})

function decimalToNumber(val: any) {
  if (val === null || val === undefined) return val
  if (typeof val === 'object' && typeof val.toNumber === 'function') return val.toNumber()

  return val
}

function serializeMeasurements(measurements: any[]) {
  return measurements.map(m => ({
    ...m,
    weight_kg: decimalToNumber(m.weight_kg),
    height_cm: decimalToNumber(m.height_cm),
    temperature_c: decimalToNumber(m.temperature_c)
  }))
}

export async function getPatientList(
  {
    page = 1,
    pageSize = 20,
    name,
    city,
    status,
    organisationId
  }: {
    page?: number
    pageSize?: number
    name?: string
    city?: string
    status?: string
    organisationId: number
  } = { organisationId: 0 }
) {
  const skip = (page - 1) * pageSize
  const where: any = { organisation_id: organisationId }

  if (name) {
    where.name = { contains: name, mode: 'insensitive' }
  }

  if (city) {
    where.city = { contains: city, mode: 'insensitive' }
  }

  if (status) {
    where.status = status
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      skip,
      take: pageSize,
      where,
      include: {
        patient_measurements: true,
        patient_medical: true,
        patient_medical_history: true,
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone_number: true
          }
        }
      }
    }),
    prisma.patient.count({ where })
  ])

  // Map null string fields to undefined and serialize measurements
  const patientsSafe = patients.map(p => ({
    ...p,
    doctor: p.doctor ?? undefined,
    status: p.status ?? undefined,
    avatar: p.avatar ?? undefined,
    address: p.address ?? undefined,
    city: p.city ?? undefined,
    phone_number: p.phone_number ?? undefined,
    email: p.email ?? undefined,
    birthdate: p.birthdate ?? undefined,
    emergency_contact_name: p.emergency_contact_name ?? undefined,
    emergency_contact_phone: p.emergency_contact_phone ?? undefined,
    emergency_contact_email: p.emergency_contact_email ?? undefined,
    created_at: p.created_at ?? undefined,
    updated_at: p.updated_at ?? undefined,
    patient_measurements: serializeMeasurements(p.patient_measurements)
  }))

  return {
    patients: patientsSafe,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export async function createPatient(data: any) {
  const parsed = patientSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Validation failed', details: parsed.error.flatten() }
  }

  try {
    const {
      name,
      birthdate,
      gender,
      status,
      phone_number,
      doctor_id,
      avatar,
      address,
      city,
      email,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_email
    } = parsed.data

    const data: any = { name, birthdate: new Date(birthdate), gender, status, phone_number }

    if (doctor_id !== undefined) data.doctor_id = doctor_id
    if (avatar !== undefined) data.avatar = avatar
    if (address !== undefined) data.address = address
    if (city !== undefined) data.city = city
    if (email !== undefined) data.email = email
    if (emergency_contact_name !== undefined) data.emergency_contact_name = emergency_contact_name
    if (emergency_contact_phone !== undefined) data.emergency_contact_phone = emergency_contact_phone
    if (emergency_contact_email !== undefined) data.emergency_contact_email = emergency_contact_email
    console.log('Creating patient with data:', data)
    const patient = await prisma.patient.create({ data })

    return { success: true, patient }
  } catch (error) {
    console.error('Prisma error:', error)

    return { error: 'Database error', details: error }
  }
}

export async function getPatientById(id: number) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      patient_measurements: true,
      patient_medical: true,
      patient_medical_history: true,
      doctor: {
        select: {
          id: true,
          name: true,
          specialty: true,
          email: true,
          phone_number: true
        }
      }
    }
  })

  if (!patient) return null

  return {
    ...patient,
    status: patient.status ?? undefined,
    avatar: patient.avatar ?? undefined,
    address: patient.address ?? undefined,
    city: patient.city ?? undefined,
    phone_number: patient.phone_number ?? undefined,
    email: patient.email ?? undefined,
    birthdate: patient.birthdate ?? undefined,
    emergency_contact_name: patient.emergency_contact_name ?? undefined,
    emergency_contact_phone: patient.emergency_contact_phone ?? undefined,
    emergency_contact_email: patient.emergency_contact_email ?? undefined,
    created_at: patient.created_at ?? undefined,
    updated_at: patient.updated_at ?? undefined,
    patient_measurements: serializeMeasurements(patient.patient_measurements)
  }
}

// Fetch all appointments for a given patient_id
export async function getAppointmentsByPatientId(patient_id: number) {
  const appointments = await prisma.patient_appointment.findMany({
    where: { patient_id },
    include: {
      doctor: true,
      organisation: true,
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
    },
    orderBy: { appointment_date: 'desc' }
  })

  // Map the appointments to include visit information
  return appointments.map(appointment => ({
    ...appointment,
    visit: appointment.patient_visits[0] || undefined,
    patient_visits: undefined // Remove the array since we only need the latest visit
  }))
}

// Fetch paginated appointments for the appointments list
export async function getAppointmentsList({
  page = 1,
  pageSize = 20,
  patientName,
  status
}: {
  page?: number
  pageSize?: number
  patientName?: string
  status?: string
} = {}) {
  const skip = (page - 1) * pageSize
  const where: any = {}

  if (patientName) {
    where.patient = { name: { contains: patientName, mode: 'insensitive' } }
  }

  if (status) {
    where.status = status
  }

  const [appointments, total] = await Promise.all([
    prisma.patient_appointment.findMany({
      skip,
      take: pageSize,
      where,
      include: {
        patient: true,
        doctor: true
      },
      orderBy: { appointment_date: 'desc' }
    }),
    prisma.patient_appointment.count({ where })
  ])

  return {
    appointments,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export async function getAllPatients() {
  const patients = await prisma.patient.findMany({
    select: { id: true, name: true }
  })

  return patients
}

export async function updatePatient(patientId: number, data: any) {
  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: data.name,
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
      gender: data.gender,
      doctor_id: data.doctor_id,
      status: data.status,
      avatar: data.avatar,
      address: data.address,
      city: data.city,
      phone_number: data.phone_number,
      email: data.email,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone,
      emergency_contact_email: data.emergency_contact_email,
      updated_at: new Date()
    }
  })

  // Fetch the updated patient with related data
  const patientWithRelations = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      patient_measurements: true,
      patient_medical: true,
      patient_medical_history: true,
      doctor: {
        select: {
          id: true,
          name: true,
          specialty: true,
          email: true,
          phone_number: true
        }
      }
    }
  })

  if (!patientWithRelations) {
    throw new Error('Patient not found after update')
  }

  return {
    ...patientWithRelations,
    status: patientWithRelations.status ?? undefined,
    avatar: patientWithRelations.avatar ?? undefined,
    address: patientWithRelations.address ?? undefined,
    city: patientWithRelations.city ?? undefined,
    phone_number: patientWithRelations.phone_number ?? undefined,
    email: patientWithRelations.email ?? undefined,
    birthdate: patientWithRelations.birthdate ?? undefined,
    emergency_contact_name: patientWithRelations.emergency_contact_name ?? undefined,
    emergency_contact_phone: patientWithRelations.emergency_contact_phone ?? undefined,
    emergency_contact_email: patientWithRelations.emergency_contact_email ?? undefined,
    created_at: patientWithRelations.created_at ?? undefined,
    updated_at: patientWithRelations.updated_at ?? undefined,
    patient_measurements: serializeMeasurements(patientWithRelations.patient_measurements)
  }
}
