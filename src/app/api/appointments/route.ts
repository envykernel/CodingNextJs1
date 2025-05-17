import { NextResponse } from 'next/server'

import { createAppointment, getAppointments } from '@/app/server/appointmentsActions'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter')
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    const appointments = await getAppointments({
      filter: filter || undefined,
      status: status || undefined,
      type: type || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)

    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const data = await request.json()
  const result = await createAppointment(data)

  if (result.success) {
    return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json' } })
  } else {
    return new Response(JSON.stringify(result), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}
