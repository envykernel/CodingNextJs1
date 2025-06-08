import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// Map frontend certificate types to database template codes
const CERTIFICATE_TYPE_MAP: Record<string, string> = {
  sick_leave: 'CERT_ARRET_TRAVAIL',
  fitness: 'CERT_APT_SPORT',
  consultation: 'CERT_MED_SIMPLE'
}

// GET /api/certificates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)

    const certificates = await prisma.certificate.findMany({
      where: {
        organisationId
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        template: {
          select: {
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ certificates })
  } catch (error) {
    console.error('Error fetching certificates:', error)

    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}

// POST /api/certificates
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patientId, type, startDate, endDate, notes } = body

    if (!patientId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Map the frontend type to the database template code
    const templateCode = CERTIFICATE_TYPE_MAP[type]

    if (!templateCode) {
      return NextResponse.json({ error: 'Invalid certificate type' }, { status: 400 })
    }

    const organisationId = parseInt(session.user.organisationId)

    // Find the appropriate template based on the type
    const template = await prisma.certificateTemplate.findFirst({
      where: {
        code: templateCode,
        OR: [
          { organisationId: null }, // Shared templates
          { organisationId } // Organization-specific templates
        ]
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Invalid certificate type' }, { status: 400 })
    }

    // Get the current doctor from the session
    const doctor = await prisma.doctor.findFirst({
      where: {
        organisation_id: organisationId

        // You might want to add more conditions here to find the correct doctor
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'No doctor found for this organization' }, { status: 400 })
    }

    // Generate a unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create the certificate
    const certificate = await prisma.certificate.create({
      data: {
        templateId: template.id,
        organisationId,
        patientId: parseInt(patientId),
        doctorId: doctor.id,
        certificateNumber,
        status: 'draft',
        content: template.contentTemplate, // You might want to process this with the actual values
        variables: {
          startDate,
          endDate,
          notes

          // Add other variables as needed
        },
        notes
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true
          }
        },
        template: {
          select: {
            code: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Error creating certificate:', error)

    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}
