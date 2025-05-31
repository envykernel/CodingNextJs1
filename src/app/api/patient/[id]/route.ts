import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const patientId = parseInt(id)

    if (isNaN(patientId)) {
      return new NextResponse('Invalid patient ID', { status: 400 })
    }

    const body = await request.json()

    // Check if patient exists and belongs to the user's organization
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined
      }
    })

    if (!existingPatient) {
      return new NextResponse('Patient not found', { status: 404 })
    }

    // Find the doctor by name if provided
    let doctorId: number | undefined

    if (body.doctor) {
      const doctor = await prisma.doctor.findFirst({
        where: {
          name: body.doctor,
          organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined
        }
      })

      doctorId = doctor?.id
    }

    // Update the patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        name: body.name,
        birthdate: body.birthdate ? new Date(body.birthdate) : undefined,
        gender: body.gender,
        doctor_id: doctorId, // Use doctor_id instead of doctor
        status: body.status,
        avatar: body.avatar,
        address: body.address,
        city: body.city,
        phone_number: body.phone_number,
        email: body.email,
        emergency_contact_name: body.emergency_contact_name,
        emergency_contact_phone: body.emergency_contact_phone,
        emergency_contact_email: body.emergency_contact_email,
        updated_at: new Date()
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone_number: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, patient: updatedPatient })
  } catch (error) {
    console.error('Error updating patient:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
