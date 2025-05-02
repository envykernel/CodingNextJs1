// 'use server'

// Type Imports
// (Optional) import type { PatientType } from '@/views/apps/patient/list/PatientListTable'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
