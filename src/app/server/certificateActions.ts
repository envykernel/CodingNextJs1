'use server'

import { prisma } from '@/libs/prisma'

interface CertificateWithRelations {
  id: number
  certificateNumber: string
  content: string
  createdAt: Date
  patient: {
    id: number
    name: string
    birthdate: Date
    gender: string
  }
  doctor: {
    id: number
    name: string
  } | null
  organisation: {
    id: number
    name: string
    address: string | null
    city: string | null
    phone_number: string | null
    email: string | null
    has_pre_printed_header: boolean
    has_pre_printed_footer: boolean
    header_height: number | null
    footer_height: number | null
  }
  template: {
    id: number
    name: string
    code: string
    category: string
  } | null
}

export type { CertificateWithRelations }

export async function getCertificate(id: string): Promise<CertificateWithRelations> {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: true,
        doctor: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true,
            has_pre_printed_header: true,
            has_pre_printed_footer: true,
            header_height: true,
            footer_height: true
          }
        },
        template: true
      }
    })

    if (!certificate) {
      throw new Error('Certificate not found')
    }

    return certificate
  } catch (error) {
    console.error('Error in getCertificate:', error)
    throw new Error('Failed to fetch certificate')
  }
}

// Additional utility functions for certificates

export async function getCertificatesByPatient(patientId: number, orderBy?: any) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        patientId: patientId
      },
      include: {
        doctor: true,
        template: true
      },
      orderBy: orderBy || {
        createdAt: 'desc'
      }
    })

    return certificates
  } catch (error) {
    console.error('Error in getCertificatesByPatient:', error)
    throw new Error('Failed to fetch certificates')
  }
}

export async function getCertificatesByDoctor(doctorId: number, orderBy?: any) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        doctorId: doctorId
      },
      include: {
        patient: true,
        template: true
      },
      orderBy: orderBy || {
        createdAt: 'desc'
      }
    })

    return certificates
  } catch (error) {
    console.error('Error in getCertificatesByDoctor:', error)
    throw new Error('Failed to fetch certificates')
  }
}

export async function getCertificatesByVisit(visitId: number, orderBy?: any) {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        visitId: visitId
      },
      include: {
        patient: true,
        doctor: true,
        template: true
      },
      orderBy: orderBy || {
        createdAt: 'desc'
      }
    })

    return certificates
  } catch (error) {
    console.error('Error in getCertificatesByVisit:', error)
    throw new Error('Failed to fetch certificates')
  }
}

export async function getCertificateTemplates(orderBy?: any) {
  try {
    const templates = await prisma.certificateTemplate.findMany({
      where: {
        isActive: true
      },
      orderBy: orderBy || {
        name: 'asc'
      }
    })

    return templates
  } catch (error) {
    console.error('Error in getCertificateTemplates:', error)
    throw new Error('Failed to fetch certificate templates')
  }
}

export async function createCertificate(data: any) {
  try {
    const certificate = await prisma.certificate.create({
      data: {
        certificateNumber: data.certificateNumber,
        content: data.content,
        patientId: data.patientId,
        doctorId: data.doctorId,
        visitId: data.visitId,
        templateId: data.templateId,
        organisationId: data.organisationId
      },
      include: {
        patient: true,
        doctor: true,
        template: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true
          }
        }
      }
    })

    return certificate
  } catch (error) {
    console.error('Error in createCertificate:', error)
    throw new Error('Failed to create certificate')
  }
}

export async function updateCertificate(id: number, data: any) {
  try {
    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        content: data.content,
        doctorId: data.doctorId,
        templateId: data.templateId
      },
      include: {
        patient: true,
        doctor: true,
        template: true,
        organisation: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone_number: true,
            email: true
          }
        }
      }
    })

    return certificate
  } catch (error) {
    console.error('Error in updateCertificate:', error)
    throw new Error('Failed to update certificate')
  }
}

export async function deleteCertificate(id: number) {
  try {
    await prisma.certificate.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error('Error in deleteCertificate:', error)
    throw new Error('Failed to delete certificate')
  }
}

// Additional functions for API routes

export async function getCertificatesByOrganisation(organisationId: number, orderBy?: any) {
  try {
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
      orderBy: orderBy || {
        createdAt: 'desc'
      }
    })

    return certificates
  } catch (error) {
    console.error('Error in getCertificatesByOrganisation:', error)
    throw new Error('Failed to fetch certificates')
  }
}

export async function createCertificateWithTemplate(data: any) {
  try {
    const { patientId, type, notes, content, doctorId, organisationId } = data

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
      throw new Error('Template not found')
    }

    // Verify the doctor exists and belongs to the organization
    const doctor = await prisma.doctor.findFirst({
      where: {
        id: parseInt(doctorId),
        organisation_id: organisationId
      }
    })

    if (!doctor) {
      throw new Error('Doctor not found in organization')
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

    return certificate
  } catch (error) {
    console.error('Error in createCertificateWithTemplate:', error)
    throw new Error('Failed to create certificate')
  }
}

export async function getCertificateTemplatesByOrganisation(organisationId: number, orderBy?: any) {
  try {
    const templates = await prisma.certificateTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { organisationId: null }, // Shared templates
          { organisationId } // Organization-specific templates
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
        contentTemplate: true,
        variablesSchema: true
      },
      orderBy: orderBy || {
        category: 'asc'
      }
    })

    return templates
  } catch (error) {
    console.error('Error in getCertificateTemplatesByOrganisation:', error)
    throw new Error('Failed to fetch certificate templates')
  }
}

export async function verifyCertificateAccess(certificateId: number, organisationId: number) {
  try {
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        organisationId
      }
    })

    return certificate !== null
  } catch (error) {
    console.error('Error in verifyCertificateAccess:', error)
    throw new Error('Failed to verify certificate access')
  }
}
