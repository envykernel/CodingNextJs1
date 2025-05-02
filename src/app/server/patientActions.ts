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
  doctor: z.string().optional(),
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

export async function getPatientList({
  page = 1,
  pageSize = 20,
  name,
  city,
  status
}: {
  page?: number
  pageSize?: number
  name?: string
  city?: string
  status?: string
} = {}) {
  const skip = (page - 1) * pageSize
  const where: any = {}

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
        patient_medical_history: true
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
      doctor,
      avatar,
      address,
      city,
      email,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_email
    } = parsed.data

    const data: any = { name, birthdate: new Date(birthdate), gender, status, phone_number }

    if (doctor !== undefined) data.doctor = doctor
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
