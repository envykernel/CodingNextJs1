'use server'

import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'
import { prismaDecimalToNumber } from '@/utils/prismaDecimalToNumber'
import type { PrescriptionFormValues } from '@/components/prescriptions/PrescriptionForm'
import { requireAuthAndOrg } from './utils'

export async function getVisitsByAppointmentIds(appointmentIds: number[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organisationId) {
    throw new Error('User not authenticated or no organization assigned')
  }

  const organisationId = parseInt(session.user.organisationId)

  const visits = await prisma.patient_visit.findMany({
    where: {
      appointment_id: { in: appointmentIds },
      organisation_id: organisationId
    },
    select: {
      id: true,
      appointment_id: true,
      visit_date: true,
      start_time: true,
      end_time: true,
      status: true,
      notes: true,
      created_at: true
    }
  })

  const map: Record<number, any> = {}

  visits.forEach(v => {
    if (v.appointment_id) {
      map[v.appointment_id] = {
        ...v,
        visit_date: v.visit_date ? v.visit_date.toISOString().split('T')[0] : null,
        created_at: v.created_at ? v.created_at.toISOString() : null
      }
    }
  })

  return map
}

export async function getVisitById(id: number) {
  const visit = await prisma.patient_visit.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
      organisation: true,
      patient_measurement: true,
      clinical_exams: true,
      prescriptions: {
        include: {
          lines: true,
          doctor: true
        }
      },
      radiology_orders: {
        include: {
          exam_type: true
        }
      }
    }
  })

  if (!visit) return null

  // Convert dates to ISO strings and handle decimal values
  const serializedVisit = {
    ...visit,
    visit_date: visit.visit_date ? visit.visit_date.toISOString().split('T')[0] : null,
    start_time: visit.start_time, // Already a string in HH:mm format
    end_time: visit.end_time, // Already a string in HH:mm format
    created_at: visit.created_at ? visit.created_at.toISOString() : null,
    patient: visit.patient
      ? {
          ...visit.patient,
          birthdate: visit.patient.birthdate ? visit.patient.birthdate.toISOString().split('T')[0] : null
        }
      : null
  }

  return prismaDecimalToNumber(serializedVisit)
}

export async function savePrescriptionForVisit(visitId: number, data: PrescriptionFormValues) {
  // Add auth and org check
  const { organisationId } = await requireAuthAndOrg()

  // Fetch visit with org check - this ensures we can only access visits from our organization
  const visit = await prisma.patient_visit.findUnique({
    where: {
      id: visitId,
      organisation_id: organisationId
    },
    include: { doctor: true, organisation: true, patient: true }
  })

  if (!visit) throw new Error('Visit not found')

  // Create prescription using the verified visit's data
  await prisma.prescription.create({
    data: {
      visit_id: visitId,
      doctor_id: visit.doctor_id!,
      organisation_id: visit.organisation_id, // Safe to use as we've verified the visit belongs to our org
      patient_id: visit.patient_id,
      notes: data.notes,
      lines: {
        create: data.medications.map(med => ({
          drug_name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.notes
        }))
      }
    }
  })
}

export async function updatePrescriptionForVisit(visitId: number, data: PrescriptionFormValues) {
  const { organisationId } = await requireAuthAndOrg()

  // Find prescription with org check
  const prescription = await prisma.prescription.findFirst({
    where: {
      visit_id: visitId,
      organisation_id: organisationId
    },
    include: { lines: true }
  })

  if (!prescription) {
    throw new Error('Prescription not found for this visit')
  }

  // Delete lines with org check
  await prisma.prescription_line.deleteMany({
    where: {
      prescription_id: prescription.id,
      prescription: {
        organisation_id: organisationId
      }
    }
  })

  // Create new lines
  await prisma.prescription_line.createMany({
    data: data.medications.map(med => ({
      prescription_id: prescription.id,
      drug_name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.notes
    }))
  })

  // Update prescription with org check
  await prisma.prescription.update({
    where: {
      id: prescription.id,
      organisation_id: organisationId
    },
    data: { notes: data.notes }
  })
}

export async function getVisitDaysDistribution() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organisationId) {
    throw new Error('Unauthorized')
  }

  const thirtyDaysAgo = new Date()

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const visits = await prisma.patient_visit.findMany({
    where: {
      organisation_id: Number(session.user.organisationId),
      visit_date: {
        gte: thirtyDaysAgo
      }
    },
    select: {
      visit_date: true
    }
  })

  // Initialize counts for each day of the week (0-6, where 0 is Sunday)
  const dayCounts = Array(7).fill(0)

  // Count visits for each day of the week
  visits.forEach(visit => {
    const dayOfWeek = visit.visit_date.getDay() // 0-6 (Sunday-Saturday)

    dayCounts[dayOfWeek]++
  })

  // Map the counts to day names in English format for translation
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  return dayNames.map((day, index) => ({
    day,
    count: dayCounts[index]
  }))
}
