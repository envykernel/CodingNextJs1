export async function updateVisitDoctorAndFetch(visitId: number, doctorId: number) {
  // Update the doctor
  const patchRes = await fetch(`/api/visits/${visitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_id: doctorId })
  })

  if (!patchRes.ok) {
    const data = await patchRes.json()

    throw new Error(data.error || 'Error updating doctor')
  }

  // Fetch the full visit data
  const fullVisitRes = await fetch(`/api/visits/${visitId}`)

  if (!fullVisitRes.ok) throw new Error('Error fetching updated visit data')
  const { visit: fullVisit } = await fullVisitRes.json()

  return fullVisit
}
