export interface Patient {
  id: number
  name: string
  birthdate: string // ISO date string
  gender: string
}

export interface Doctor {
  id: number
  name: string
  specialty?: string
}

export interface CertificateTemplate {
  id: number
  code: string
  name: string
  description: string
  category: string
  contentTemplate: string
  variablesSchema: {
    type: string
    properties: {
      [key: string]: {
        type: string
        description?: string
        format?: string
        enum?: string[]
        default?: any
      }
    }
    required?: string[]
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Certificate {
  id: number
  templateId: number
  organisationId: number
  patientId: number
  doctorId: number
  certificateNumber: string
  status: 'draft' | 'issued' | 'expired' | 'cancelled'
  content: string
  version: number
  parentVersionId?: number
  issuedAt?: string
  validityDays?: number
  notes?: string
  createdAt: string
  updatedAt: string
  finalizedAt?: string
  patient?: Patient
  doctor?: Doctor
  template?: CertificateTemplate
  organisation?: {
    id: number
    name: string
  }
}
