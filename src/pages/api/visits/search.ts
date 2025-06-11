import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'

import { prisma } from '@/prisma/prisma'
import { authOptions } from '@/libs/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the session
    const session = await getServerSession(req, res, authOptions)

    // Check authentication
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { patientIds } = req.query

    if (!patientIds) {
      return res.status(400).json({ error: 'Missing patientIds parameter' })
    }

    // Parse patient IDs - handle both string and array inputs
    let patientIdArray: number[]

    try {
      // If patientIds is a string, split it by comma
      const patientIdsStr = Array.isArray(patientIds) ? patientIds[0] : patientIds

      patientIdArray = patientIdsStr
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => {
          const num = parseInt(id, 10)

          if (isNaN(num) || num <= 0) {
            throw new Error(`Invalid patient ID: ${id}`)
          }

          return num
        })

      if (patientIdArray.length === 0) {
        return res.status(400).json({ error: 'No valid patient IDs provided' })
      }
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid patient IDs',
        details: error instanceof Error ? error.message : 'Failed to parse patient IDs'
      })
    }

    // Get the organization ID from the session
    const organisationId = session.user?.organisationId

    if (!organisationId) {
      return res.status(400).json({ error: 'Organization ID not found in session' })
    }

    // Fetch visits from the database
    const visits = await prisma.patient_visit.findMany({
      where: {
        patient_id: {
          in: patientIdArray
        },
        organisation_id: Number(organisationId)
      },
      include: {
        patient: {
          select: {
            name: true
          }
        },
        appointment: {
          select: {
            appointment_type: true
          }
        }
      },
      orderBy: {
        visit_date: 'desc'
      }
    })

    // Format the response to match the frontend expectations
    const formattedVisits = visits.map(visit => ({
      id: visit.id,
      patient_id: visit.patient_id,
      patient_name: visit.patient.name,
      date: visit.visit_date.toISOString(),
      status: visit.status,
      type: visit.appointment?.appointment_type || 'consultation'
    }))

    return res.status(200).json(formattedVisits)
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to search visits',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
