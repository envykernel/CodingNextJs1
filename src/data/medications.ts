export interface Medication {
  id: string
  name: string
  category: string
  commonDosages: string[]
  commonFrequency: string[]
  commonDuration: string[]
}

export const medications: Medication[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    category: 'Antibiotic',
    commonDosages: ['250mg', '500mg', '875mg'],
    commonFrequency: ['Once daily', 'Twice daily', 'Three times daily'],
    commonDuration: ['5 days', '7 days', '10 days', '14 days']
  },
  {
    id: '2',
    name: 'Ibuprofen',
    category: 'Pain Relief',
    commonDosages: ['200mg', '400mg', '600mg'],
    commonFrequency: ['Every 4-6 hours', 'Every 8 hours', 'As needed'],
    commonDuration: ['3 days', '5 days', '7 days', 'As needed']
  },
  {
    id: '3',
    name: 'Omeprazole',
    category: 'Antacid',
    commonDosages: ['20mg', '40mg'],
    commonFrequency: ['Once daily', 'Twice daily'],
    commonDuration: ['14 days', '30 days', '60 days']
  },
  {
    id: '4',
    name: 'Metformin',
    category: 'Diabetes',
    commonDosages: ['500mg', '850mg', '1000mg'],
    commonFrequency: ['Once daily', 'Twice daily', 'Three times daily'],
    commonDuration: ['30 days', '60 days', '90 days']
  },
  {
    id: '5',
    name: 'Lisinopril',
    category: 'Blood Pressure',
    commonDosages: ['5mg', '10mg', '20mg', '40mg'],
    commonFrequency: ['Once daily'],
    commonDuration: ['30 days', '60 days', '90 days']
  }
]
