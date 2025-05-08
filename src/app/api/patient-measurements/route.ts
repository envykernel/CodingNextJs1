import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { prisma } from '@/prisma/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      visit_id,
      weight_kg,
      height_cm,
      temperature_c,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      pulse,
      oxygen_saturation,
      respiratory_rate,
      notes
    } = body

    if (!visit_id) {
      return NextResponse.json({ error: 'Missing visit_id' }, { status: 400 })
    }

    // Check if a measurement already exists for this visit (1-1 relation)
    const existing = await prisma.patient_measurements.findFirst({
      where: { visit_id: visit_id }
    })

    let measurement

    if (existing) {
      // Update existing
      measurement = await prisma.patient_measurements.update({
        where: { visit_id: visit_id },
        data: {
          weight_kg: weight_kg ? Number(weight_kg) : null,
          height_cm: height_cm ? Number(height_cm) : null,
          temperature_c: temperature_c ? Number(temperature_c) : null,
          blood_pressure_systolic: blood_pressure_systolic ? Number(blood_pressure_systolic) : null,
          blood_pressure_diastolic: blood_pressure_diastolic ? Number(blood_pressure_diastolic) : null,
          pulse: pulse ? Number(pulse) : null,
          oxygen_saturation: oxygen_saturation ? Number(oxygen_saturation) : null,
          respiratory_rate: respiratory_rate ? Number(respiratory_rate) : null,
          notes: notes || null
        }
      })
    } else {
      // Fetch patient_id and organisation_id from patient_visit
      const visit = await prisma.patient_visit.findUnique({
        where: { id: visit_id },
        select: { patient_id: true, organisation_id: true }
      })

      if (!visit) {
        return NextResponse.json({ error: 'Invalid visit_id' }, { status: 400 })
      }

      // Create new
      measurement = await prisma.patient_measurements.create({
        data: {
          visit_id,
          patient_id: visit.patient_id,
          organisation_id: visit.organisation_id,
          weight_kg: weight_kg ? Number(weight_kg) : null,
          height_cm: height_cm ? Number(height_cm) : null,
          temperature_c: temperature_c ? Number(temperature_c) : null,
          blood_pressure_systolic: blood_pressure_systolic ? Number(blood_pressure_systolic) : null,
          blood_pressure_diastolic: blood_pressure_diastolic ? Number(blood_pressure_diastolic) : null,
          pulse: pulse ? Number(pulse) : null,
          oxygen_saturation: oxygen_saturation ? Number(oxygen_saturation) : null,
          respiratory_rate: respiratory_rate ? Number(respiratory_rate) : null,
          notes: notes || null
        }
      })
    }

    return NextResponse.json({ measurement }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
