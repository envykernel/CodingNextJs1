import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

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
      console.error('Missing required fields:', { patient_id, organisation_id, hasDescription: !!description })

      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const patientIdNum = Number(patient_id)
    const organisationIdNum = Number(organisation_id)

    if (isNaN(patientIdNum) || isNaN(organisationIdNum)) {
      console.error('Invalid IDs:', { patient_id, organisation_id })

      return NextResponse.json({ error: 'Invalid patient or organisation ID' }, { status: 400 })
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
    console.error('Error creating medical history:', error)

    return NextResponse.json({ error: 'Failed to create medical history' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      console.error('Missing patientId parameter')

      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    const patientIdNum = parseInt(patientId)

    if (isNaN(patientIdNum)) {
      console.error('Invalid patientId:', patientId)

      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 })
    }

    console.log('Fetching medical history for patient:', patientIdNum)

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
    console.error('Error fetching medical history:', error)

    return NextResponse.json({ error: 'Failed to fetch medical history' }, { status: 500 })
  }
}
