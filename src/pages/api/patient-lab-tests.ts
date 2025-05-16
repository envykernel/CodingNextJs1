import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/prisma/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { patientId } = req.query

  if (!patientId) return res.status(400).json({ error: 'Missing patientId' })

  try {
    // Get all lab test orders for the patient, ordered by date
    const orders = await prisma.lab_test_order.findMany({
      where: {
        patient_id: Number(patientId),
        status: {
          in: ['completed', 'pending'] // Include both completed and pending tests
        }
      },
      include: {
        test_type: true,
        visit: true
      },
      orderBy: {
        ordered_at: 'desc'
      }
    })

    // Group by test type and get the latest result for each
    const latestResults = orders.reduce((acc: any, order) => {
      const testTypeId = order.test_type_id

      // If we haven't seen this test type yet, or if this result is more recent
      if (!acc[testTypeId] || new Date(order.ordered_at!) > new Date(acc[testTypeId].ordered_at)) {
        acc[testTypeId] = {
          id: order.id,
          test_name: order.test_type.name,
          category: order.test_type.category,
          result_value: order.result_value,
          result_unit: order.result_unit || order.test_type.default_unit,
          reference_range: order.reference_range || order.test_type.default_reference_range,
          ordered_at: order.ordered_at,
          visit_date: order.visit?.visit_date,
          status: order.status // Include the status in the response
        }
      }

      return acc
    }, {})

    // Convert to array and sort by test name
    const results = Object.values(latestResults).sort((a: any, b: any) => a.test_name.localeCompare(b.test_name))

    res.status(200).json(results)
  } catch (error) {
    console.error('Error fetching patient lab tests:', error)
    res.status(500).json({ error: 'Failed to fetch patient lab tests' })
  }
}
