import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import {
  UserError,
  ServerError,
  ValidationError,
  NotFoundError,
  formatErrorResponse,
  logError
} from '@/utils/errorHandler'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patient_id, organisation_id, history_type, description, date_occurred } = body

    console.log('Creating medical history with data:', {
      patient_id,
      organisation_id,
      history_type,
      description: description?.substring(0, 50) + '...', // Log only first 50 chars of description
      date_occurred
    })

    if (!patient_id || !organisation_id || !description) {
      throw new ValidationError('Missing required fields: patient_id, organisation_id, and description are required')
    }

    const patientIdNum = Number(patient_id)
    const organisationIdNum = Number(organisation_id)

    if (isNaN(patientIdNum) || isNaN(organisationIdNum)) {
      throw new ValidationError('Invalid patient or organisation ID format')
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientIdNum },
      select: { id: true }
    })

    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    const medicalHistory = await prisma.patient_medical_history.create({
      data: {
        patient_id: patientIdNum,
        organisation_id: organisationIdNum,
        history_type,
        description,
        date_occurred: date_occurred ? new Date(date_occurred) : null
      }
    })

    console.log('Created medical history record:', medicalHistory.id)

    return NextResponse.json(medicalHistory)
  } catch (error) {
    // Log error for debugging
    logError(error, 'patient-medical-history POST API')

    // Handle different error types
    if (error instanceof UserError || error instanceof ValidationError || error instanceof NotFoundError) {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      throw new ValidationError('Patient ID is required')
    }

    const patientIdNum = parseInt(patientId)

    if (isNaN(patientIdNum)) {
      throw new ValidationError('Invalid patient ID format')
    }

    console.log('Fetching medical history for patient:', patientIdNum)

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientIdNum },
      select: { id: true }
    })

    if (!patient) {
      throw new NotFoundError('Patient not found')
    }

    const medicalHistory = await prisma.patient_medical_history.findMany({
      where: {
        patient_id: patientIdNum
      },
      orderBy: {
        date_occurred: 'desc'
      }
    })

    console.log('Found medical history records:', medicalHistory.length)

    return NextResponse.json(medicalHistory)
  } catch (error) {
    // Log error for debugging
    logError(error, 'patient-medical-history GET API')

    // Handle different error types
    if (error instanceof UserError || error instanceof ValidationError || error instanceof NotFoundError) {
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
