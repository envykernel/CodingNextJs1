// 'use server'

// Type Imports
// (Optional) import type { PatientType } from '@/views/apps/patient/list/PatientListTable'

import { z } from 'zod'
import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'
import { requireAuthAndOrg } from './utils'

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
    // Add auth and org check
    const { organisationId } = await requireAuthAndOrg()

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

    const patientData: any = {
      name,
      birthdate: new Date(birthdate),
      gender,
      status,
      phone_number,
      organisation_id: organisationId // Add organization ID to the data
    }

    if (doctor_id !== undefined) patientData.doctor_id = doctor_id
    if (avatar !== undefined) patientData.avatar = avatar
    if (address !== undefined) patientData.address = address
    if (city !== undefined) patientData.city = city
    if (email !== undefined) patientData.email = email
    if (emergency_contact_name !== undefined) patientData.emergency_contact_name = emergency_contact_name
    if (emergency_contact_phone !== undefined) patientData.emergency_contact_phone = emergency_contact_phone
    if (emergency_contact_email !== undefined) patientData.emergency_contact_email = emergency_contact_email

    const patient = await prisma.patient.create({ data: patientData })

    return { success: true, patient }
  } catch (error) {
    console.error('Prisma error:', error)

    return { error: 'Database error', details: error }
  }
}

export async function getPatientById(id: number) {
  // Add auth and org check
  const { organisationId } = await requireAuthAndOrg()

  const patient = await prisma.patient.findUnique({
    where: {
      id,
      organisation_id: organisationId // Add organization check
    },
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
  const session = await getServerSession(authOptions)

  if (!session?.user?.organisationId) {
    throw new Error('User not authenticated or no organization assigned')
  }

  const organisationId = parseInt(session.user.organisationId)

  const appointments = await prisma.patient_appointment.findMany({
    where: {
      patient_id,
      organisation_id: organisationId
    },
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
  const session = await getServerSession(authOptions)

  if (!session?.user?.organisationId) {
    throw new Error('User not authenticated or no organization assigned')
  }

  const organisationId = parseInt(session.user.organisationId)
  const skip = (page - 1) * pageSize

  const where: any = {
    organisation_id: organisationId
  }

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

export async function getAllPatients(search?: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organisationId) {
    throw new Error('User not authenticated or no organization assigned')
  }

  const organisationId = parseInt(session.user.organisationId)

  const where: any = { organisation_id: organisationId }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }

  const patients = await prisma.patient.findMany({
    where,
    select: {
      id: true,
      name: true,
      birthdate: true,
      gender: true,
      doctor: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return patients
}

export async function updatePatient(patientId: number, data: any) {
  try {
    // Add auth and org check
    const { organisationId } = await requireAuthAndOrg()

    // Update with organization check in where clause
    await prisma.patient.update({
      where: {
        id: patientId,
        organisation_id: organisationId // Add organization check
      },
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

    // Fetch the updated patient with related data, including organization check
    const patientWithRelations = await prisma.patient.findUnique({
      where: {
        id: patientId,
        organisation_id: organisationId // Add organization check
      },
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
  } catch (error) {
    return { error: 'Database error', details: error }
  }
}
