import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

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
        organisation: {
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

    const { patientId, type, notes, content, doctorId } = await request.json()

    if (!patientId || !type || !doctorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const organisationId = parseInt(session.user.organisationId)

    // Get the template
    const template = await prisma.certificateTemplate.findFirst({
      where: {
        code: type,
        isActive: true,
        OR: [
          { organisationId: null }, // Shared templates
          { organisationId } // Organization-specific templates
        ]
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Verify the doctor exists and belongs to the organization
    const doctor = await prisma.doctor.findFirst({
      where: {
        id: parseInt(doctorId),
        organisation_id: organisationId
      }
    })

    if (!doctor) {
      return NextResponse.json(
        {
          error: 'Doctor not found',
          details: 'The selected doctor was not found in your organization.'
        },
        { status: 404 }
      )
    }

    // Generate a unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create the certificate with the content
    const certificate = await prisma.certificate.create({
      data: {
        templateId: template.id,
        organisationId,
        patientId: parseInt(patientId),
        doctorId: doctor.id,
        certificateNumber,
        status: 'draft',
        content,
        notes: notes || ''
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
        organisation: {
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
