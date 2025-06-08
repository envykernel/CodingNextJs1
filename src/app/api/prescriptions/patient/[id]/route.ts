import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patientId = parseInt(params.id)

    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 })
    }

    console.log('Fetching prescriptions for patient:', patientId)

    // Get all prescriptions for the patient
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient_id: patientId,
        organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        },
        lines: true,
        visit: {
          select: {
            id: true,
            visit_date: true,
            appointment_id: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    console.log('Raw prescriptions data:', JSON.stringify(prescriptions, null, 2))

    // Format the response
    const formattedPrescriptions = prescriptions.map(prescription => {
      console.log('Processing prescription:', prescription.id, 'Visit:', prescription.visit)

      return {
        id: prescription.id,
        date: prescription.visit?.visit_date,
        doctor: prescription.doctor.name,
        visitId: prescription.visit?.id,
        medications: prescription.lines.map(line => ({
          name: line.drug_name,
          dosage: line.dosage,
          frequency: line.frequency,
          duration: line.duration,
          notes: line.instructions
        })),
        notes: prescription.notes
      }
    })

    console.log('Formatted prescriptions:', JSON.stringify(formattedPrescriptions, null, 2))

    return NextResponse.json(formattedPrescriptions)
  } catch (error) {
    console.error('Error fetching prescriptions:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
