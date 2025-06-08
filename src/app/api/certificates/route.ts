import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// Helper function to fill template content with values
const fillTemplateContent = (template: string, variables: any, patient: any, doctor: any, organisation: any) => {
  let filledContent = template

  // Replace template variables with actual values
  const replacements: Record<string, string> = {
    '{{patient.name}}': patient.name,
    '{{patient.birthdate}}': patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : '',
    '{{doctor.name}}': doctor ? `Dr. ${doctor.name}` : 'Dr. [Doctor Name]',
    '{{organisation.name}}': organisation ? organisation.name : '[Organization Name]',
    '{{date}}': new Date().toLocaleDateString(),
    '{{medicalObservation}}': variables.notes || '',
    '{{startDate}}': variables.startDate ? new Date(variables.startDate).toLocaleDateString() : '',
    '{{endDate}}': variables.endDate ? new Date(variables.endDate).toLocaleDateString() : '',
    '{{sport}}': variables.sport || '',
    '{{restrictions}}': variables.restrictions || '',
    '{{duration}}': variables.duration || '',
    '{{reason}}': variables.reason || '',
    '{{validUntil}}': variables.validUntil ? new Date(variables.validUntil).toLocaleDateString() : '',
    '{{profession}}': variables.profession || '',
    '{{diagnosis}}': variables.diagnosis || '',
    '{{exoneration}}': variables.exoneration === 'oui' ? 'Oui' : 'Non',
    '{{school}}': variables.school || '',
    '{{inaptitude}}': variables.inaptitude || '',
    '{{observations}}': variables.observations || '',
    '{{ald}}': variables.ald === 'oui' ? 'Oui' : variables.ald === 'non' ? 'Non' : 'En cours',
    '{{treatment}}': variables.treatment || '',
    '{{recommendations}}': variables.recommendations || '',
    '{{nextAppointment}}': variables.nextAppointment ? new Date(variables.nextAppointment).toLocaleDateString() : '',
    '{{recipient.name}}': variables.recipient?.name || '',
    '{{recipient.specialty}}': variables.recipient?.specialty || '',
    '{{consultationReason}}': variables.consultationReason || '',
    '{{testsDone}}': variables.testsDone || '',
    '{{diagnosticHypothesis}}': variables.diagnosticHypothesis || '',
    '{{specificQuestions}}': variables.specificQuestions || '',
    '{{deathDate}}': variables.deathDate ? new Date(variables.deathDate).toLocaleDateString() : '',
    '{{deathTime}}': variables.deathTime || '',
    '{{deathPlace}}': variables.deathPlace || '',
    '{{apparentCause}}': variables.apparentCause || '',
    '{{circumstances}}': variables.circumstances || '',
    '{{suspiciousSigns}}': variables.suspiciousSigns || 'aucun',
    '{{vaccineName}}': variables.vaccineName || '',
    '{{lotNumber}}': variables.lotNumber || '',
    '{{administrationDate}}': variables.administrationDate
      ? new Date(variables.administrationDate).toLocaleDateString()
      : '',
    '{{doseNumber}}': variables.doseNumber || '',
    '{{schedule}}': variables.schedule || '',
    '{{nextDoseDate}}': variables.nextDoseDate ? new Date(variables.nextDoseDate).toLocaleDateString() : '',
    '{{sideEffects}}': variables.sideEffects || 'aucun'
  }

  // Replace all variables in the content
  Object.entries(replacements).forEach(([key, value]) => {
    filledContent = filledContent.replace(new RegExp(key, 'g'), value)
  })

  return filledContent
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

    const body = await request.json()
    const { patientId, type, startDate, endDate, notes, content } = body

    if (!patientId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const organisationId = parseInt(session.user.organisationId)

    // Find the template directly using the type (which is now the template code)
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
      return NextResponse.json({ error: 'Invalid certificate type' }, { status: 400 })
    }

    // Get the current doctor from the session
    const doctor = await prisma.doctor.findFirst({
      where: {
        organisation_id: organisationId
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'No doctor found for this organization' }, { status: 400 })
    }

    // Get the patient
    const patient = await prisma.patient.findUnique({
      where: {
        id: parseInt(patientId)
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Get the organization
    const organisation = await prisma.organisation.findUnique({
      where: {
        id: organisationId
      }
    })

    if (!organisation) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Generate a unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Prepare variables object
    const variables = {
      startDate,
      endDate,
      notes,

      // Add other variables based on the template type
      ...(template.code === 'CERT_APT_SPORT' && {
        sport: body.sport,
        restrictions: body.restrictions,
        duration: body.duration,
        reason: body.reason,
        validUntil: body.validUntil
      }),
      ...(template.code === 'CERT_MALADIE_CHRONIQUE' && {
        diagnosis: body.diagnosis,
        ald: body.ald,
        treatment: body.treatment,
        recommendations: body.recommendations,
        nextAppointment: body.nextAppointment
      })

      // Add other template-specific variables as needed
    }

    // Fill the template content with actual values, or use provided content
    const filledContent =
      content || fillTemplateContent(template.contentTemplate, variables, patient, doctor, organisation)

    // Create the certificate with the filled content
    const certificate = await prisma.certificate.create({
      data: {
        templateId: template.id,
        organisationId,
        patientId: parseInt(patientId),
        doctorId: doctor.id,
        certificateNumber,
        status: 'draft',
        content: filledContent, // Save the filled content
        variables,
        notes
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
