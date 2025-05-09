import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/prisma/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { visitId, patientId, doctorId, organisationId, tests } = req.body

    if (!visitId || !patientId || !organisationId || !Array.isArray(tests) || tests.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const results = await Promise.all(
      tests.map(async (test: any) => {
        // Check if a lab_test_order already exists for this visit/test_type
        const existing = await prisma.lab_test_order.findFirst({
          where: {
            visit_id: visitId,
            test_type_id: test.id
          }
        })

        const isModification = !!existing

        const status = isModification && test.result_value ? 'completed' : 'pending'

        if (existing) {
          // Update
          return prisma.lab_test_order.update({
            where: { id: existing.id },
            data: {
              result_value: test.result_value,
              result_unit: test.result_unit,
              reference_range: test.reference_range,
              notes: test.notes,
              status
            }
          })
        } else {
          // Create
          return prisma.lab_test_order.create({
            data: {
              visit_id: visitId,
              patient_id: patientId,
              doctor_id: doctorId || null,
              test_type_id: test.id,
              organisation_id: organisationId,
              result_value: test.result_value,
              result_unit: test.result_unit,
              reference_range: test.reference_range,
              notes: test.notes,
              status
            }
          })
        }
      })
    )

    res.status(200).json({ success: true, results })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save lab test orders' })
  }
}
