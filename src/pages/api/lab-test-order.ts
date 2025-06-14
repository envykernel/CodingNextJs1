import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/prisma/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { visitId, patientId, doctorId, organisationId, tests } = req.body

    if (!visitId || !patientId || !organisationId || !Array.isArray(tests)) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get all existing tests for this visit
    const existingTests = await prisma.lab_test_order.findMany({
      where: {
        visit_id: visitId
      },
      select: {
        id: true,
        test_type_id: true
      }
    })

    // Create a map of submitted test type IDs
    const submittedTestTypeIds = new Set(tests.map(test => test.id))

    // Find tests to delete (exist in database but not in submitted tests)
    const testsToDelete = existingTests.filter(test => !submittedTestTypeIds.has(test.test_type_id))

    // Delete tests that are no longer present
    if (testsToDelete.length > 0) {
      await prisma.lab_test_order.deleteMany({
        where: {
          id: {
            in: testsToDelete.map(test => test.id)
          }
        }
      })
    }

    // Process the submitted tests (create or update)
    const results = await Promise.all(
      tests.map(async (test: any) => {
        // Check if a lab_test_order already exists for this visit/test_type
        const existing = await prisma.lab_test_order.findFirst({
          where: {
            visit_id: visitId,
            test_type_id: test.id
          }
        })

        // Set status based on whether there's a result value
        const status = test.result_value && test.result_value.trim() !== '' ? 'completed' : 'pending'

        if (existing) {
          // Update
          return prisma.lab_test_order.update({
            where: { id: existing.id },
            data: {
              doctor_id: doctorId,
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
              doctor_id: doctorId,
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

    // Fetch the updated visit data to return
    const updatedVisit = await prisma.patient_visit.findUnique({
      where: { id: visitId },
      include: {
        lab_test_orders: {
          include: {
            test_type: true,
            doctor: true
          }
        }
      }
    })

    res.status(200).json({ success: true, results, visit: updatedVisit })
  } catch (error) {
    console.error('Error saving lab test orders:', error)
    res.status(500).json({ error: 'Failed to save lab test orders' })
  }
}
