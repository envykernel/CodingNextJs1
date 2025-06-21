import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'
import { createPrescription, updatePrescription } from '@/app/server/prescriptionActions'
import {
  UserError,
  ServerError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  formatErrorResponse,
  logError
} from '@/utils/errorHandler'

// Helper function to check for existing prescription
async function getExistingPrescription(visitId: number) {
  return await prisma.prescription.findFirst({
    where: { visit_id: visitId }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received prescription save request')
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new AuthenticationError('Please sign in to continue')
    }

    console.log('Session found for user:', session.user?.email)
    const data = await request.json()

    console.log('Request data:', JSON.stringify(data, null, 2))
    const { visit_id, medications, notes } = data

    if (!visit_id) {
      throw new ValidationError('Visit ID is required')
    }

    // Fetch visit to get doctor_id, organisation_id, patient_id
    console.log('Fetching visit details for visit_id:', visit_id)

    const visit = await prisma.patient_visit.findUnique({
      where: { id: visit_id },
      include: { doctor: true, organisation: true, patient: true }
    })

    if (!visit) {
      throw new NotFoundError('Visit not found')
    }

    console.log('Visit found:', {
      id: visit.id,
      doctor_id: visit.doctor_id,
      organisation_id: visit.organisation_id,
      patient_id: visit.patient_id
    })

    // Check if a prescription already exists for this visit
    console.log('Checking for existing prescription')

    const existingPrescription = await getExistingPrescription(visit_id)

    if (existingPrescription) {
      console.log('Found existing prescription:', existingPrescription.id)

      // Update existing prescription using the action
      const lines = medications.map((med: any) => ({
        drug_name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.notes
      }))

      await updatePrescription(existingPrescription.id, { notes, lines })
      console.log('Prescription updated successfully')
    } else {
      console.log('No existing prescription found, creating new one')

      // Create new prescription using the action
      const lines = medications.map((med: any) => ({
        drug_name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.notes
      }))

      await createPrescription({
        visit_id,
        doctor_id: visit.doctor_id!,
        organisation_id: visit.organisation_id,
        patient_id: visit.patient_id,
        notes,
        lines
      })

      console.log('New prescription created successfully')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log error for debugging
    logError(error, 'prescriptions API')

    // Handle different error types
    if (
      error instanceof UserError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof AuthenticationError
    ) {
      return NextResponse.json(formatErrorResponse(error), { status: error.status })
    }

    // Handle database-specific errors
    if (
      error instanceof Error &&
      (error.message.includes('connect') || error.message.includes('database') || error.message.includes('prisma'))
    ) {
      const dbError = new ServerError('Database operation failed')

      return NextResponse.json(formatErrorResponse(dbError), { status: 500 })
    }

    // Generic server error
    const serverError = new ServerError()

    return NextResponse.json(formatErrorResponse(serverError), { status: 500 })
  }
}
