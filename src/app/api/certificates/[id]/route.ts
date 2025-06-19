import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

// DELETE /api/certificates/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.organisationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const certificateId = parseInt(id)
    const organisationId = parseInt(session.user.organisationId)

    // Check if the certificate exists and belongs to the organization
    const certificate = await prisma.certificate.findFirst({
      where: {
        id: certificateId,
        organisationId
      }
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Delete the certificate
    await prisma.certificate.delete({
      where: {
        id: certificateId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 })
  }
}
