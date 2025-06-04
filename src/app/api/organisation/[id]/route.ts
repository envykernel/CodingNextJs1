import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'
import { prisma } from '@/prisma/prisma'

/**
 * Organisation API Route
 *
 * Note: This route shows a Next.js warning about using params.id synchronously.
 * The warning occurs because Next.js expects params to be awaited in dynamic API routes.
 * However, the current implementation works correctly in production (returns 200 responses)
 * and is used by multiple components:
 * - EditOrganisationDrawer (fetch/update org details)
 * - AddCard (invoice creation)
 * - getOrganisationAvailability (appointment scheduling)
 * - Various dashboard components
 *
 * TODO: In a future update, consider updating to use awaited params:
 * ```typescript
 * export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
 *   const { id } = await params;
 *   // ... rest of the code
 * }
 * ```
 * This change should be made only after thorough testing of all dependent components.
 */

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const organisationId = parseInt(id)

    if (isNaN(organisationId)) {
      return new NextResponse('Invalid organisation ID', { status: 400 })
    }

    // Verify that the user has access to this organization
    if (session.user.organisationId !== id) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: {
        id: true,
        name: true,
        address: true,
        phone_number: true,
        email: true,
        status: true,
        working_days: true,
        work_start_time: true,
        work_end_time: true,
        break_start_time: true,
        break_end_time: true
      }
    })

    if (!organisation) {
      return new NextResponse('Organisation not found', { status: 404 })
    }

    return NextResponse.json({ organisation })
  } catch (error) {
    console.error('Error fetching organisation:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const organisationId = parseInt(resolvedParams.id)

    if (isNaN(organisationId)) {
      return new NextResponse('Invalid organisation ID', { status: 400 })
    }

    // Verify that the user has access to this organization
    if (session.user.organisationId !== resolvedParams.id) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    // Verify that the user is an admin or cabinet manager
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CABINET_MANAGER') {
      return new NextResponse('Only administrators and cabinet managers can update organisation details', {
        status: 403
      })
    }

    const body = await request.json()

    // Update the organisation
    const updatedOrganisation = await prisma.organisation.update({
      where: { id: organisationId },
      data: {
        name: body.name,
        address: body.address,
        phone_number: body.phone_number,
        email: body.email,
        status: body.status,
        working_days: body.working_days,
        work_start_time: body.work_start_time,
        work_end_time: body.work_end_time,
        break_start_time: body.break_start_time,
        break_end_time: body.break_end_time
      }
    })

    return NextResponse.json({ organisation: updatedOrganisation })
  } catch (error) {
    console.error('Error updating organisation:', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
