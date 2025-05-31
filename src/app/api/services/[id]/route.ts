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
    const serviceId = parseInt(id)

    if (isNaN(serviceId)) {
      return new NextResponse('Invalid service ID', { status: 400 })
    }

    const body = await request.json()

    // Check if service exists and belongs to the user's organization
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined
      }
    })

    if (!existingService) {
      return new NextResponse('Service not found', { status: 404 })
    }

    // Validate amount is greater than zero only if it's being updated
    if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount <= 0)) {
      return new NextResponse(JSON.stringify({ error: 'services.error.invalidAmount' }), { status: 400 })
    }

    // Update the service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(body.amount !== undefined && { amount: body.amount }),
        is_active: body.is_active,
        updated_at: new Date()
      }
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Error updating service:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const serviceId = parseInt(id)

    if (isNaN(serviceId)) {
      return new NextResponse('Invalid service ID', { status: 400 })
    }

    // Check if service exists and belongs to the user's organization
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        organisation_id: session.user.organisationId ? parseInt(session.user.organisationId) : undefined
      },
      include: {
        invoice_lines: true
      }
    })

    if (!existingService) {
      return new NextResponse('Service not found', { status: 404 })
    }

    // Check if service has any invoice lines
    if (existingService.invoice_lines.length > 0) {
      return new NextResponse('Cannot delete service that has been used in invoices', { status: 400 })
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: serviceId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting service:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
