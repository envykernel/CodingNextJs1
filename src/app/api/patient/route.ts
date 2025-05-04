import { z } from 'zod'

import { prisma } from '@/prisma/prisma'

const patientSchema = z.object({
  name: z.string().min(1),
  phone_number: z.string().min(1),
  gender: z.string().min(1),
  status: z.string().min(1),
  birthdate: z.string().min(1),
  doctor: z.string().optional(),
  avatar: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  email: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_email: z.string().optional()
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = patientSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const {
      name,
      birthdate,
      gender,
      status,
      phone_number,
      doctor,
      avatar,
      address,
      city,
      email,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_email
    } = parsed.data

    const data: any = { name, birthdate: new Date(birthdate), gender, status, phone_number }

    if (doctor !== undefined) data.doctor = doctor
    if (avatar !== undefined) data.avatar = avatar
    if (address !== undefined) data.address = address
    if (city !== undefined) data.city = city
    if (email !== undefined) data.email = email
    if (emergency_contact_name !== undefined) data.emergency_contact_name = emergency_contact_name
    if (emergency_contact_phone !== undefined) data.emergency_contact_phone = emergency_contact_phone
    if (emergency_contact_email !== undefined) data.emergency_contact_email = emergency_contact_email
    const patient = await prisma.patient.create({ data })

    return new Response(JSON.stringify({ success: true, patient }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Prisma error:', error)

    return new Response(
      JSON.stringify({
        error: 'Database error',
        details: error instanceof Error ? error.message : JSON.stringify(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
