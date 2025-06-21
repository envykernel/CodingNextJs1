import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { getCertificatesByOrganisation, createCertificateWithTemplate } from '@/app/server/certificateActions'

// GET /api/certificates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)

    const certificates = await getCertificatesByOrganisation(organisationId)

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
    const organisationId = parseInt(session.user.organisationId)

    const certificate = await createCertificateWithTemplate({
      ...body,
      organisationId
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Error creating certificate:', error)

    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}
