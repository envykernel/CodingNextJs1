import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      visit_id,
      chief_complaint,
      history_illness,
      medical_history,
      general_appearance,
      cardiovascular,
      respiratory,
      gastrointestinal,
      neurological,
      musculoskeletal,
      skin,
      ent,
      assessment,
      plan
    } = body

    if (!visit_id) {
      return NextResponse.json({ error: 'Missing visit_id' }, { status: 400 })
    }

    // Check if a clinical exam already exists for this visit (1-1 relation)
    const existing = await prisma.clinical_exam.findFirst({
      where: { visit_id: visit_id }
    })

    let clinicalExam

    if (existing) {
      // Update existing
      clinicalExam = await prisma.clinical_exam.update({
        where: { id: existing.id },
        data: {
          chief_complaint: chief_complaint || null,
          history_illness: history_illness || null,
          medical_history: medical_history || null,
          general_appearance: general_appearance || null,
          cardiovascular: cardiovascular || null,
          respiratory: respiratory || null,
          gastrointestinal: gastrointestinal || null,
          neurological: neurological || null,
          musculoskeletal: musculoskeletal || null,
          skin: skin || null,
          ent: ent || null,
          assessment: assessment || null,
          plan: plan || null
        }
      })
    } else {
      // Fetch organisation_id from patient_visit
      const visit = await prisma.patient_visit.findUnique({
        where: { id: visit_id },
        select: { organisation_id: true }
      })

      if (!visit) {
        return NextResponse.json({ error: 'Invalid visit_id' }, { status: 400 })
      }

      // Create new
      clinicalExam = await prisma.clinical_exam.create({
        data: {
          visit_id,
          organisation_id: visit.organisation_id,
          chief_complaint: chief_complaint || null,
          history_illness: history_illness || null,
          medical_history: medical_history || null,
          general_appearance: general_appearance || null,
          cardiovascular: cardiovascular || null,
          respiratory: respiratory || null,
          gastrointestinal: gastrointestinal || null,
          neurological: neurological || null,
          musculoskeletal: musculoskeletal || null,
          skin: skin || null,
          ent: ent || null,
          assessment: assessment || null,
          plan: plan || null
        }
      })
    }

    return NextResponse.json({ clinicalExam }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
