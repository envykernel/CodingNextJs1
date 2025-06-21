import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getPrescriptionsByPatient } from '@/app/server/prescriptionActions'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patientId = parseInt(id)

    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 })
    }

    // Get all prescriptions for the patient using the action
    const organisationId = session.user.organisationId ? parseInt(session.user.organisationId) : undefined

    const prescriptions = await getPrescriptionsByPatient(
      patientId,
      {
        created_at: 'desc'
      },
      organisationId
    )

    // Format the response
    const formattedPrescriptions = prescriptions.map(prescription => {
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

    return NextResponse.json(formattedPrescriptions)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
