import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Received prescription save request')
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log('No session found - unauthorized')

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Session found for user:', session.user?.email)
    const data = await request.json()

    console.log('Request data:', JSON.stringify(data, null, 2))
    const { visit_id, medications, notes } = data

    if (!visit_id) {
      console.log('No visit_id provided')

      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 })
    }

    // Fetch visit to get doctor_id, organisation_id, patient_id
    console.log('Fetching visit details for visit_id:', visit_id)

    const visit = await prisma.patient_visit.findUnique({
      where: { id: visit_id },
      include: { doctor: true, organisation: true, patient: true }
    })

    if (!visit) {
      console.log('Visit not found for id:', visit_id)

      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    console.log('Visit found:', {
      id: visit.id,
      doctor_id: visit.doctor_id,
      organisation_id: visit.organisation_id,
      patient_id: visit.patient_id
    })

    // Check if a prescription already exists for this visit
    console.log('Checking for existing prescription')

    const existingPrescription = await prisma.prescription.findFirst({
      where: { visit_id }
    })

    if (existingPrescription) {
      console.log('Found existing prescription:', existingPrescription.id)

      // Update existing prescription
      // Delete all existing lines
      console.log('Deleting existing prescription lines')
      await prisma.prescription_line.deleteMany({
        where: { prescription_id: existingPrescription.id }
      })

      // Create new lines
      console.log('Creating new prescription lines')
      await prisma.prescription_line.createMany({
        data: medications.map((med: any) => ({
          prescription_id: existingPrescription.id,
          drug_name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.notes
        }))
      })

      // Update prescription main fields
      console.log('Updating prescription notes')
      await prisma.prescription.update({
        where: { id: existingPrescription.id },
        data: { notes }
      })
      console.log('Prescription updated successfully')
    } else {
      console.log('No existing prescription found, creating new one')

      // Create new prescription
      const newPrescription = await prisma.prescription.create({
        data: {
          visit_id,
          doctor_id: visit.doctor_id!,
          organisation_id: visit.organisation_id,
          patient_id: visit.patient_id,
          notes,
          lines: {
            create: medications.map((med: any) => ({
              drug_name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.notes
            }))
          }
        }
      })

      console.log('New prescription created successfully:', newPrescription.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving prescription:', error)

    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
