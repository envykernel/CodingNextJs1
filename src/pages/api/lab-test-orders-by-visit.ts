import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/prisma/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { visitId } = req.query

  if (!visitId) return res.status(400).json({ error: 'Missing visitId' })

  try {
    const orders = await prisma.lab_test_order.findMany({
      where: { visit_id: Number(visitId) },
      include: { test_type: true }
    })

    res.status(200).json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lab test orders' })
  }
}
