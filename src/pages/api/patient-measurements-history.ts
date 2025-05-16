import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/prisma/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const { patientId } = req.query

    if (!patientId) {
      return res.status(400).json({ error: 'Missing patientId' })
    }

    const measurements = await prisma.patient_measurements.findMany({
      where: {
        patient_id: Number(patientId)
      },
      orderBy: {
        measured_at: 'asc'
      }
    })

    res.status(200).json({ measurements })
  } catch (error) {
    console.error('Error fetching patient measurements:', error)
    res.status(500).json({ error: 'Failed to fetch patient measurements' })
  }
}
