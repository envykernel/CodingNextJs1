import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'
import { prismaDecimalToNumber } from '@/utils/prismaDecimalToNumber'
import type { PrescriptionFormValues } from '@/components/prescriptions/PrescriptionForm'

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
    created_at: visit.created_at ? visit.created_at.toISOString() : null
  }

  return prismaDecimalToNumber(serializedVisit)
}

export async function savePrescriptionForVisit(visitId: number, data: PrescriptionFormValues) {
  // Fetch visit to get doctor_id, organisation_id, patient_id
  const visit = await prisma.patient_visit.findUnique({
    where: { id: visitId },
    include: { doctor: true, organisation: true, patient: true }
  })

  if (!visit) throw new Error('Visit not found')

  await prisma.prescription.create({
    data: {
      visit_id: visitId,
      doctor_id: visit.doctor_id!,
      organisation_id: visit.organisation_id,
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
  // Find the existing prescription for this visit
  const prescription = await prisma.prescription.findFirst({
    where: { visit_id: visitId },
    include: { lines: true }
  })

  if (!prescription) {
    throw new Error('Prescription not found for this visit')
  }

  // Delete all existing lines
  await prisma.prescription_line.deleteMany({
    where: { prescription_id: prescription.id }
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

  // Update prescription main fields
  await prisma.prescription.update({
    where: { id: prescription.id },
    data: {
      notes: data.notes

      // doctor_id and other fields can be updated if needed
    }
  })
}
