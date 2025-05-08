import { prisma } from '@/prisma/prisma'
import { prismaDecimalToNumber } from '@/utils/prismaDecimalToNumber'

export async function getVisitsByAppointmentIds(appointmentIds: number[]) {
  const visits = await prisma.patient_visit.findMany({
    where: { appointment_id: { in: appointmentIds } }
  })

  const map: Record<number, any> = {}

  visits.forEach(v => {
    if (v.appointment_id) map[v.appointment_id] = v
  })

  return map
}

export async function getVisitById(id: number) {
  const visit = await prisma.patient_visit.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
      organisation: true,
      patient_measurement: true,
      clinical_exams: true
    }
  })

  return prismaDecimalToNumber(visit)
}
