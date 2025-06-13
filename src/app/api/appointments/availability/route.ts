import { getOrganisationAvailability } from '@/app/server/appointmentsActions'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const organisation_id = searchParams.get('organisation_id')
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined

  if (!organisation_id) {
    return new Response(JSON.stringify({ error: 'Missing organisation_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const availability = await getOrganisationAvailability(Number(organisation_id), startDate, endDate)

    return new Response(JSON.stringify(availability), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch availability' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
