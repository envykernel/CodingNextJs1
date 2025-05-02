import type { NextApiRequest, NextApiResponse } from 'next'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const parsed = patientSchema.safeParse(req.body)

  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

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

    res.status(201).json({ success: true, patient })
  } catch (error) {
    console.error('Prisma error:', error)
    res.status(500).json({ error: 'Database error', details: error })
  }
}
