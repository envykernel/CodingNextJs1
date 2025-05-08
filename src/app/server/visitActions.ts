import { prisma } from '@/prisma/prisma'
import { prismaDecimalToNumber } from '@/utils/prismaDecimalToNumber'
import type { PrescriptionFormValues } from '@/components/prescriptions/PrescriptionForm'

export async function getVisitsByAppointmentIds(appointmentIds: number[]) {
  const visits = await prisma.patient_visit.findMany({
    where: { appointment_id: { in: appointmentIds } }
  })

  const map: Record<number, any> = {}

  visits.forEach(v => {
    if (v.appointment_id) map[v.appointment_id] = v
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
      clinical_exams: true
    }
  })

  return prismaDecimalToNumber(visit)
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
