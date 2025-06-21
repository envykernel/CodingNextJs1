# Next.js Data Access Structure - Best Practices

This document outlines the recommended folder structure for organizing data access in Next.js applications, with examples and explanations for each approach.

## 🏗️ Recommended Structure

```
src/
├── data/                           # 🎯 Main data access folder
│   ├── services/                   # Database layer (Prisma, etc.)
│   │   ├── index.ts               # Export all services
│   │   ├── patient.service.ts     # Patient-related queries
│   │   ├── measurement.service.ts # Measurement-related queries
│   │   ├── visit.service.ts       # Visit-related queries
│   │   ├── appointment.service.ts # Appointment-related queries
│   │   └── user.service.ts        # User-related queries
│   │
│   ├── actions/                    # Server Actions (Next.js 13+)
│   │   ├── index.ts               # Export all actions
│   │   ├── patient.actions.ts     # Patient server actions
│   │   ├── measurement.actions.ts # Measurement server actions
│   │   ├── visit.actions.ts       # Visit server actions
│   │   └── user.actions.ts        # User server actions
│   │
│   ├── hooks/                      # React hooks for client-side
│   │   ├── index.ts               # Export all hooks
│   │   ├── usePatient.ts          # Patient data hook
│   │   ├── useMeasurement.ts      # Measurement data hook
│   │   ├── useVisit.ts            # Visit data hook
│   │   └── useUser.ts             # User data hook
│   │
│   ├── api/                        # API Routes (Pages Router)
│   │   ├── patients/
│   │   │   ├── route.ts           # GET /api/patients, POST /api/patients
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts       # GET /api/patients/[id], PUT, DELETE
│   │   │   │   └── measurements/
│   │   │   │       └── route.ts   # GET /api/patients/[id]/measurements
│   │   │   └── search/
│   │   │       └── route.ts       # GET /api/patients/search
│   │   ├── measurements/
│   │   │   ├── route.ts           # GET /api/measurements, POST
│   │   │   └── [id]/
│   │   │       └── route.ts       # GET /api/measurements/[id], PUT, DELETE
│   │   └── visits/
│   │       ├── route.ts           # GET /api/visits, POST
│   │       └── [id]/
│   │           └── route.ts       # GET /api/visits/[id], PUT, DELETE
│   │
│   ├── types/                      # TypeScript types and interfaces
│   │   ├── index.ts               # Export all types
│   │   ├── patient.types.ts       # Patient-related types
│   │   ├── measurement.types.ts   # Measurement-related types
│   │   ├── visit.types.ts         # Visit-related types
│   │   └── common.types.ts        # Common/shared types
│   │
│   ├── utils/                      # Data utilities and helpers
│   │   ├── index.ts               # Export all utilities
│   │   ├── validation.ts          # Data validation helpers
│   │   ├── transformation.ts      # Data transformation helpers
│   │   └── caching.ts             # Caching utilities
│   │
│   └── config/                     # Data configuration
│       ├── index.ts               # Export all config
│       ├── database.ts            # Database configuration
│       └── api.ts                 # API configuration
```

## 📁 Detailed Structure Explanation

### **1. `/data/services/` - Database Layer**

**Purpose**: Direct database operations using Prisma, MongoDB, etc.

```typescript
// src/data/services/patient.service.ts
import { prisma } from '@/lib/prisma'
import type { Patient, PatientCreateInput, PatientUpdateInput } from '@/data/types'

export class PatientService {
  static async findAll(organisationId: number, filters?: PatientFilters) {
    return prisma.patient.findMany({
      where: { organisation_id: organisationId, ...filters },
      include: { doctor: true }
    })
  }

  static async findById(id: number, organisationId: number) {
    return prisma.patient.findUnique({
      where: { id, organisation_id: organisationId },
      include: { doctor: true, measurements: true }
    })
  }

  static async create(data: PatientCreateInput, organisationId: number) {
    return prisma.patient.create({
      data: { ...data, organisation_id: organisationId },
      include: { doctor: true }
    })
  }

  static async update(id: number, data: PatientUpdateInput, organisationId: number) {
    return prisma.patient.update({
      where: { id, organisation_id: organisationId },
      data,
      include: { doctor: true }
    })
  }

  static async delete(id: number, organisationId: number) {
    return prisma.patient.delete({
      where: { id, organisation_id: organisationId }
    })
  }
}
```

### **2. `/data/actions/` - Server Actions**

**Purpose**: Next.js 13+ server actions with authentication and validation

```typescript
// src/data/actions/patient.actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientService } from '@/data/services'
import { validatePatientData } from '@/data/utils/validation'
import type { PatientCreateInput, PatientUpdateInput } from '@/data/types'

export async function getPatientsAction(filters?: PatientFilters) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organisationId) {
    throw new Error('Unauthorized')
  }

  const organisationId = parseInt(session.user.organisationId)
  return PatientService.findAll(organisationId, filters)
}

export async function getPatientAction(id: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organisationId) {
    throw new Error('Unauthorized')
  }

  const organisationId = parseInt(session.user.organisationId)
  return PatientService.findById(id, organisationId)
}

export async function createPatientAction(data: PatientCreateInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organisationId) {
    throw new Error('Unauthorized')
  }

  const organisationId = parseInt(session.user.organisationId)

  // Validate data
  const validation = validatePatientData(data)
  if (!validation.success) {
    throw new Error(validation.errors.join(', '))
  }

  return PatientService.create(data, organisationId)
}

export async function updatePatientAction(id: number, data: PatientUpdateInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organisationId) {
    throw new Error('Unauthorized')
  }

  const organisationId = parseInt(session.user.organisationId)
  return PatientService.update(id, data, organisationId)
}

export async function deletePatientAction(id: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organisationId) {
    throw new Error('Unauthorized')
  }

  const organisationId = parseInt(session.user.organisationId)
  return PatientService.delete(id, organisationId)
}
```

### **3. `/data/hooks/` - React Hooks**

**Purpose**: Client-side data fetching with error handling and caching

```typescript
// src/data/hooks/usePatient.ts
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/contexts/translationContext'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import type { Patient, PatientFilters } from '@/data/types'

interface UsePatientOptions {
  patientId?: number
  filters?: PatientFilters
  autoFetch?: boolean
}

export function usePatient(options: UsePatientOptions = {}) {
  const { patientId, filters = {}, autoFetch = true } = options
  const { t } = useTranslation()

  const [data, setData] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)

  const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler({
    context: 'PatientData',
    showUserErrors: true,
    showServerErrors: true
  })

  // Fetch single patient
  const fetchPatient = useCallback(
    async (id: number) => {
      await handleAsyncOperation(async () => {
        const res = await fetch(`/api/patients/${id}`)

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(t('errors.notFound.patientNotFound'))
          }
          throw new Error(t('errors.fetchFailed'))
        }

        const result = await res.json()
        setData(result.patient)
        return result.patient
      })
    },
    [handleAsyncOperation, t]
  )

  // Fetch patients list
  const fetchPatients = useCallback(
    async (patientFilters: PatientFilters = {}) => {
      await handleAsyncOperation(async () => {
        const queryParams = new URLSearchParams()

        if (patientFilters.search) queryParams.append('search', patientFilters.search)
        if (patientFilters.status) queryParams.append('status', patientFilters.status)
        if (patientFilters.limit) queryParams.append('limit', patientFilters.limit.toString())

        const res = await fetch(`/api/patients?${queryParams.toString()}`)

        if (!res.ok) {
          throw new Error(t('errors.fetchFailed'))
        }

        const result = await res.json()
        setPatients(result.patients)
        setTotal(result.total)
        return result
      })
    },
    [handleAsyncOperation, t]
  )

  // Create patient
  const createPatient = useCallback(
    async (patientData: any) => {
      await handleAsyncOperation(async () => {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData)
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || t('errors.createFailed'))
        }

        const result = await res.json()
        return result.patient
      })
    },
    [handleAsyncOperation, t]
  )

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      if (patientId) {
        fetchPatient(patientId)
      } else {
        fetchPatients(filters)
      }
    }
  }, [autoFetch, patientId, fetchPatient, fetchPatients, filters])

  return {
    // Data
    data,
    patients,
    total,

    // State
    error,
    isLoading,

    // Actions
    fetchPatient,
    fetchPatients,
    createPatient,
    clearError,

    // Utilities
    refetch: () => {
      if (patientId) {
        fetchPatient(patientId)
      } else {
        fetchPatients(filters)
      }
    }
  }
}
```

### **4. `/data/api/` - API Routes**

**Purpose**: RESTful API endpoints for client-side consumption

```typescript
// src/data/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientService } from '@/data/services'
import { validatePatientData } from '@/data/utils/validation'
import { formatErrorResponse } from '@/utils/errorHandler'
import type { PatientCreateInput } from '@/data/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organisationId) {
      return NextResponse.json(formatErrorResponse(new Error('Unauthorized')), { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const result = await PatientService.findAll(organisationId, filters)

    return NextResponse.json({
      patients: result.patients,
      total: result.total,
      hasMore: result.hasMore
    })
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organisationId) {
      return NextResponse.json(formatErrorResponse(new Error('Unauthorized')), { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)
    const body = (await request.json()) as PatientCreateInput

    // Validate data
    const validation = validatePatientData(body)
    if (!validation.success) {
      return NextResponse.json(formatErrorResponse(new Error(validation.errors.join(', '))), { status: 400 })
    }

    const patient = await PatientService.create(body, organisationId)

    return NextResponse.json({ patient }, { status: 201 })
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 })
  }
}
```

```typescript
// src/data/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PatientService } from '@/data/services'
import { formatErrorResponse } from '@/utils/errorHandler'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organisationId) {
      return NextResponse.json(formatErrorResponse(new Error('Unauthorized')), { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)
    const patientId = parseInt(params.id)

    const patient = await PatientService.findById(patientId, organisationId)

    if (!patient) {
      return NextResponse.json(formatErrorResponse(new Error('Patient not found')), { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organisationId) {
      return NextResponse.json(formatErrorResponse(new Error('Unauthorized')), { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)
    const patientId = parseInt(params.id)
    const body = await request.json()

    const patient = await PatientService.update(patientId, body, organisationId)

    return NextResponse.json({ patient })
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organisationId) {
      return NextResponse.json(formatErrorResponse(new Error('Unauthorized')), { status: 401 })
    }

    const organisationId = parseInt(session.user.organisationId)
    const patientId = parseInt(params.id)

    await PatientService.delete(patientId, organisationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(formatErrorResponse(error), { status: 500 })
  }
}
```

### **5. `/data/types/` - TypeScript Types**

**Purpose**: Centralized type definitions

```typescript
// src/data/types/patient.types.ts
export interface Patient {
  id: number
  name: string
  email?: string
  phone_number: string
  birthdate: Date
  gender: string
  status: string
  organisation_id: number
  doctor_id?: number
  created_at: Date
  updated_at: Date
  doctor?: Doctor
  measurements?: PatientMeasurement[]
}

export interface PatientCreateInput {
  name: string
  email?: string
  phone_number: string
  birthdate: Date
  gender: string
  status?: string
  doctor_id?: number
}

export interface PatientUpdateInput {
  name?: string
  email?: string
  phone_number?: string
  birthdate?: Date
  gender?: string
  status?: string
  doctor_id?: number
}

export interface PatientFilters {
  search?: string
  status?: string
  doctorId?: number
  limit?: number
  offset?: number
}

export interface PatientListResponse {
  patients: Patient[]
  total: number
  hasMore: boolean
}
```

### **6. `/data/utils/` - Utilities**

**Purpose**: Helper functions for data operations

```typescript
// src/data/utils/validation.ts
import { z } from 'zod'

const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  phone_number: z.string().min(1, 'Phone number is required'),
  birthdate: z.date(),
  gender: z.enum(['male', 'female', 'other']),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  doctor_id: z.number().optional()
})

export function validatePatientData(data: any) {
  const result = patientSchema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(err => err.message)
    }
  }

  return {
    success: true,
    data: result.data
  }
}
```

## 🎯 Usage Examples

### **Server Component (SSR)**

```typescript
// src/app/patients/page.tsx
import { getPatientsAction } from '@/data/actions'

export default async function PatientsPage() {
  const { patients } = await getPatientsAction({ status: 'active' })

  return (
    <div>
      {patients.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}
```

### **Client Component**

```typescript
// src/components/PatientList.tsx
'use client'

import { usePatient } from '@/data/hooks'

export default function PatientList() {
  const { patients, isLoading, error, refetch } = usePatient({
    filters: { status: 'active' },
    autoFetch: true
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {patients.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}
```

### **Form with Server Action**

```typescript
// src/components/PatientForm.tsx
'use client'

import { createPatientAction } from '@/data/actions'

export default function PatientForm() {
  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone_number: formData.get('phone') as string,
      birthdate: new Date(formData.get('birthdate') as string),
      gender: formData.get('gender') as string
    }

    await createPatientAction(data)
  }

  return (
    <form action={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

## 🏆 Benefits of This Structure

### **1. Clear Separation of Concerns**

- **Services**: Pure database operations
- **Actions**: Server-side business logic with auth
- **Hooks**: Client-side state management
- **API**: RESTful endpoints for external consumption

### **2. Scalability**

- Easy to add new domains (appointments, prescriptions, etc.)
- Consistent patterns across all data operations
- Modular and reusable components

### **3. Type Safety**

- Centralized type definitions
- Full TypeScript support
- IntelliSense and autocomplete

### **4. Performance**

- Optimized queries in services
- Proper caching strategies
- Efficient data fetching patterns

### **5. Maintainability**

- Easy to find and modify data operations
- Clear file organization
- Consistent error handling

### **6. Testing**

- Services can be easily mocked
- Isolated business logic
- Better test coverage

## 🔄 Migration Strategy

1. **Start with Services**: Create the service layer first
2. **Add Types**: Define TypeScript interfaces
3. **Create Actions**: Add server actions for server-side operations
4. **Build Hooks**: Create client-side hooks for components
5. **Add API Routes**: Create RESTful endpoints if needed
6. **Migrate Components**: Update components to use new structure

This structure provides a clean, scalable, and maintainable approach to data access in Next.js applications! 🚀
