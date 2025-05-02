// 'use server'

// Type Imports
// (Optional) import type { PatientType } from '@/views/apps/patient/list/PatientListTable'

export const getPatientData = async () => {
  // Mocked patient data
  return [
    {
      id: 1,
      name: 'John Doe',
      medicalRecordNumber: 'MRN123456',
      age: 45,
      gender: 'Male',
      diagnosis: 'Hypertension',
      doctor: 'Dr. Smith',
      admissionDate: '2024-06-01',
      status: 'admitted',
      avatar: ''
    },
    {
      id: 2,
      name: 'Jane Smith',
      medicalRecordNumber: 'MRN654321',
      age: 60,
      gender: 'Female',
      diagnosis: 'Diabetes',
      doctor: 'Dr. Brown',
      admissionDate: '2024-05-28',
      status: 'underObservation',
      avatar: ''
    }
  ]
}
