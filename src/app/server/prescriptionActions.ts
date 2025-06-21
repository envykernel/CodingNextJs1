'use server'

import { prisma } from '@/libs/prisma'

interface PrescriptionWithRelations {
  id: number
  visit_id: number
  doctor_id: number
  organisation_id: number
  patient_id: number
  created_at: Date | null
  updated_at: Date | null
  notes: string | null
  patient: {
    id: number
    name: string
    birthdate: Date
    gender: string
  }
  doctor: {
    id: number
    name: string
  }
  organisation: {
    id: number
    name: string
    address: string | null
    city: string | null
    phone_number: string | null
    email: string | null
    has_pre_printed_header: boolean
    has_pre_printed_footer: boolean
    header_height: number | null
    footer_height: number | null
  }
  lines: {
    id: number
    prescription_id: number
    drug_name: string
    dosage: string | null
    frequency: string | null
    duration: string | null
    instructions: string | null
  }[]
  visit: {
    id: number
    visit_date: Date
    start_time: string
    end_time: string
    status: string
  } | null
}

export type { PrescriptionWithRelations }

export async function getPrescription(id: string): Promise<PrescriptionWithRelations> {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        doctor: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true,
            has_pre_printed_header: true,
            has_pre_printed_footer: true,
            header_height: true,
            footer_height: true
          }
        },
        lines: true,
        visit: true
      }
    })

    if (!prescription) {
      throw new Error('Prescription not found')
    }

    return prescription
  } catch (error) {
    console.error('Error in getPrescription:', error)
    throw new Error('Failed to fetch prescription')
  }
}

// Additional utility functions for prescriptions

export async function getPrescriptionsByPatient(patientId: number, orderBy?: any, organisationId?: number) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient_id: patientId,
        ...(organisationId && { organisation_id: organisationId })
      },
      include: {
        doctor: true,
        lines: true,
        visit: true
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    return prescriptions
  } catch (error) {
    console.error('Error in getPrescriptionsByPatient:', error)
    throw new Error('Failed to fetch prescriptions')
  }
}

export async function getPrescriptionsByDoctor(doctorId: number, orderBy?: any) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctor_id: doctorId
      },
      include: {
        patient: true,
        lines: true,
        visit: true
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    return prescriptions
  } catch (error) {
    console.error('Error in getPrescriptionsByDoctor:', error)
    throw new Error('Failed to fetch prescriptions')
  }
}

export async function getPrescriptionsByVisit(visitId: number, orderBy?: any) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        visit_id: visitId
      },
      include: {
        patient: true,
        doctor: true,
        lines: true
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    return prescriptions
  } catch (error) {
    console.error('Error in getPrescriptionsByVisit:', error)
    throw new Error('Failed to fetch prescriptions')
  }
}

export async function getPrescriptionsByOrganisation(organisationId: number, orderBy?: any) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        organisation_id: organisationId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            birthdate: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true
          }
        },
        lines: true,
        visit: {
          select: {
            id: true,
            visit_date: true
          }
        }
      },
      orderBy: orderBy || {
        created_at: 'desc'
      }
    })

    return prescriptions
  } catch (error) {
    console.error('Error in getPrescriptionsByOrganisation:', error)
    throw new Error('Failed to fetch prescriptions')
  }
}

export async function createPrescription(data: any) {
  try {
    const { visit_id, doctor_id, organisation_id, patient_id, notes, lines } = data

    const prescription = await prisma.prescription.create({
      data: {
        visit_id,
        doctor_id,
        organisation_id,
        patient_id,
        notes,
        lines: {
          create: lines.map((line: any) => ({
            drug_name: line.drug_name,
            dosage: line.dosage,
            frequency: line.frequency,
            duration: line.duration,
            instructions: line.instructions
          }))
        }
      },
      include: {
        patient: true,
        doctor: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true
          }
        },
        lines: true,
        visit: true
      }
    })

    return prescription
  } catch (error) {
    console.error('Error in createPrescription:', error)
    throw new Error('Failed to create prescription')
  }
}

export async function updatePrescription(id: number, data: any) {
  try {
    const { notes, lines } = data

    // First delete existing lines
    await prisma.prescription_line.deleteMany({
      where: { prescription_id: id }
    })

    // Then update prescription and create new lines
    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        notes,
        lines: {
          create: lines.map((line: any) => ({
            drug_name: line.drug_name,
            dosage: line.dosage,
            frequency: line.frequency,
            duration: line.duration,
            instructions: line.instructions
          }))
        }
      },
      include: {
        patient: true,
        doctor: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true
          }
        },
        lines: true,
        visit: true
      }
    })

    return prescription
  } catch (error) {
    console.error('Error in updatePrescription:', error)
    throw new Error('Failed to update prescription')
  }
}

export async function deletePrescription(id: number) {
  try {
    // Delete prescription lines first (due to foreign key constraint)
    await prisma.prescription_line.deleteMany({
      where: { prescription_id: id }
    })

    // Then delete the prescription
    await prisma.prescription.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error('Error in deletePrescription:', error)
    throw new Error('Failed to delete prescription')
  }
}
