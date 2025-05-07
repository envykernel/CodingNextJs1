import { prisma } from '@/prisma/prisma'

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
