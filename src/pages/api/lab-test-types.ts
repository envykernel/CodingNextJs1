import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/prisma/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const types = await prisma.lab_test_type.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        default_unit: true,
        default_reference_range: true
      }
    })

    res.status(200).json(types)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab test types' })
  }
}
