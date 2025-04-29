export interface Medication {
  id: number
  name: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

export interface PrescriptionFormData {
  patientName: string
  doctor: string
  medications: Medication[]
  notes: string
}

export interface Prescription extends PrescriptionFormData {
  id: number
  date: string
  status: string
}
