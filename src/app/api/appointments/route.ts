import { createAppointment } from '@/app/server/appointmentsActions'

export async function POST(request: Request) {
  const data = await request.json()
  const result = await createAppointment(data)

  if (result.success) {
    return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json' } })
  } else {
    return new Response(JSON.stringify(result), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}
