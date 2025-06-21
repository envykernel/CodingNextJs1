# Medical Application - Database Data Fetching Guide

This document explains the different approaches used in this medical application to fetch data from the database, their use cases, and the reasoning behind each choice.

## 📊 Overview

This medical application uses multiple data fetching strategies depending on the context, performance requirements, and user experience needs. Understanding when and why to use each approach is crucial for maintaining consistency and performance.

## 🔄 Data Fetching Approaches

### 1. **Server-Side Rendering (SSR) with Prisma**

**Location**: `src/app/[lang]/(dashboard)/(private)/apps/patients/page.tsx`

```typescript
// Example: Patient list page
const patients = await prisma.patient.findMany({
  where: { organisation_id: organisationId },
  include: {
    doctor: { select: { name: true } },
    patient_measurements: { take: 1, orderBy: { measured_at: 'desc' } }
  },
  orderBy: { created_at: 'desc' }
})
```

**Use Cases**:

- ✅ **Initial page loads** - When users first visit a page
- ✅ **SEO-critical pages** - Patient lists, public information
- ✅ **Static data** - Data that doesn't change frequently
- ✅ **Performance-critical pages** - Reduce client-side loading time

**Why This Approach**:

- **Faster initial page load** - Data is available immediately
- **Better SEO** - Search engines can index the content
- **Reduced client-side JavaScript** - Less code sent to browser
- **Better for slow connections** - Data is pre-loaded

**When NOT to Use**:

- ❌ **Frequently changing data** - Data might be stale
- ❌ **User-specific data** - Requires authentication context
- ❌ **Interactive dashboards** - Need real-time updates

---

### 2. **Client-Side Fetching with Error Handling**

**Location**: `src/views/apps/patient/view/patient-right/dashboard/PatientMeasurementsChart.tsx`

```typescript
const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler({
  context: 'PatientMeasurementsChart',
  showUserErrors: true,
  showServerErrors: true
})

useEffect(() => {
  const fetchMeasurements = async () => {
    await handleAsyncOperation(async () => {
      const res = await fetch(`/api/patient-measurements-history?patientId=${patientId}`)

      if (!res.ok) {
        if (res.status === 404) {
          throw new NotFoundError(t('errors.notFound.patientNotFound'))
        } else if (res.status >= 400 && res.status < 500) {
          throw new UserError(t('errors.fetchFailed'))
        } else {
          throw new ServerError()
        }
      }

      return await res.json()
    })
  }

  fetchMeasurements()
}, [patientId])
```

**Use Cases**:

- ✅ **Dynamic data loading** - Data that changes based on user interactions
- ✅ **User-specific data** - Patient measurements, lab results
- ✅ **Real-time updates** - Data that needs to be fresh
- ✅ **Interactive components** - Charts, forms, dashboards

**Why This Approach**:

- **Real-time data** - Always fetch fresh data
- **User context** - Can include authentication headers
- **Error handling** - Comprehensive error management with retry
- **Loading states** - Better user experience with loading indicators
- **Internationalization** - Error messages in user's language

**When NOT to Use**:

- ❌ **Initial page loads** - Slower than SSR
- ❌ **SEO-critical content** - Not indexed by search engines
- ❌ **Static data** - Unnecessary network requests

---

### 3. **API Routes with Prisma (RESTful)**

**Location**: `src/pages/api/patient-measurements-history.ts`

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { patientId } = req.query

    if (!patientId) {
      throw new ValidationError('Patient ID is required')
    }

    const measurements = await prisma.patient_measurements.findMany({
      where: { patient_id: Number(patientId) },
      orderBy: { measured_at: 'asc' }
    })

    res.status(200).json({ measurements })
  } catch (error) {
    logError(error, 'patient-measurements-history API')

    if (error instanceof UserError || error instanceof ValidationError) {
      return res.status(error.status).json(formatErrorResponse(error))
    }

    const serverError = new ServerError()
    return res.status(500).json(formatErrorResponse(serverError))
  }
}
```

**Use Cases**:

- ✅ **CRUD operations** - Create, Read, Update, Delete
- ✅ **Data filtering** - Search, pagination, sorting
- ✅ **Authentication required** - User-specific data
- ✅ **Complex queries** - Joins, aggregations, calculations

**Why This Approach**:

- **RESTful design** - Standard HTTP methods (GET, POST, PUT, DELETE)
- **Error handling** - Structured error responses
- **Authentication** - Can verify user permissions
- **Validation** - Input validation and sanitization
- **Logging** - Track API usage and errors

**When NOT to Use**:

- ❌ **Static data** - Overkill for simple data
- ❌ **Initial page loads** - Additional network request
- ❌ **Public data** - No authentication needed

---

### 4. **App Router API Routes (Next.js 13+)**

**Location**: `src/app/api/patient/route.ts`

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = patientSchema.safeParse(body)

    if (!parsed.success) {
      const validationError = new ValidationError('Invalid patient data')
      return new Response(JSON.stringify(formatErrorResponse(validationError)), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const patient = await prisma.patient.create({
      data: parsed.data,
      include: { doctor: true }
    })

    return new Response(JSON.stringify({ success: true, patient }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    logError(error, 'patient API')
    const serverError = new ServerError()
    return new Response(JSON.stringify(formatErrorResponse(serverError)), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

**Use Cases**:

- ✅ **Modern Next.js apps** - App Router architecture
- ✅ **Type-safe APIs** - Better TypeScript integration
- ✅ **Streaming responses** - Large data sets
- ✅ **Edge runtime** - Global deployment

**Why This Approach**:

- **Modern architecture** - Next.js 13+ App Router
- **Better performance** - Edge runtime support
- **Type safety** - Better TypeScript integration
- **Streaming** - Handle large responses
- **Middleware support** - Built-in middleware

**When NOT to Use**:

- ❌ **Legacy applications** - Pages Router compatibility
- ❌ **Simple data** - Overkill for basic CRUD
- ❌ **Complex routing** - Pages Router might be simpler

---

### 5. **Direct Prisma Queries in Components**

**Location**: `src/views/apps/patient/view/patient-right/overview/index.tsx`

```typescript
// Direct database access in server components
const patientData = await prisma.patient.findUnique({
  where: { id: patientId },
  include: {
    patient_measurements: { take: 5, orderBy: { measured_at: 'desc' } },
    patient_medical_history: { take: 10, orderBy: { date_occurred: 'desc' } },
    patient_appointments: {
      where: { status: 'scheduled' },
      take: 5,
      orderBy: { appointment_date: 'asc' }
    }
  }
})
```

**Use Cases**:

- ✅ **Server components** - Next.js 13+ server components
- ✅ **Complex data relationships** - Multiple related tables
- ✅ **Performance optimization** - Single query for multiple data
- ✅ **Real-time data** - Always fresh data

**Why This Approach**:

- **No API overhead** - Direct database access
- **Complex queries** - Can use Prisma's full query power
- **Performance** - Single round trip to database
- **Type safety** - Full TypeScript support
- **Real-time** - Always current data

**When NOT to Use**:

- ❌ **Client components** - Can't use in browser
- ❌ **User-specific data** - No authentication context
- ❌ **Dynamic filtering** - Can't change queries based on user input

---

### 6. **Custom Hooks with Error Handling**

**Location**: `src/hooks/useErrorHandler.ts`

```typescript
const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler({
  context: 'ComponentName',
  showUserErrors: true,
  showServerErrors: true
})

const fetchData = async () => {
  await handleAsyncOperation(
    async () => {
      const res = await fetch('/api/data')
      if (!res.ok) throw new Error('Failed to fetch')
      return await res.json()
    },
    {
      onSuccess: data => console.log('Success:', data),
      onError: error => console.error('Error:', error)
    }
  )
}
```

**Use Cases**:

- ✅ **Reusable data fetching** - Common patterns across components
- ✅ **Error handling** - Consistent error management
- ✅ **Loading states** - Standardized loading indicators
- ✅ **Retry logic** - Automatic retry on failure

**Why This Approach**:

- **Reusability** - Can be used across multiple components
- **Consistency** - Same error handling everywhere
- **User experience** - Loading states and retry options
- **Maintainability** - Centralized logic

**When NOT to Use**:

- ❌ **Simple data** - Overkill for basic fetch
- ❌ **One-time operations** - Not reusable
- ❌ **Server components** - Client-side only

---

## 🎯 Decision Matrix

| Scenario              | Recommended Approach | Reasoning                    |
| --------------------- | -------------------- | ---------------------------- |
| **Initial page load** | SSR with Prisma      | Fast loading, SEO-friendly   |
| **User dashboard**    | Client-side fetching | Real-time, user-specific     |
| **CRUD operations**   | API Routes           | RESTful, validation, auth    |
| **Complex queries**   | Direct Prisma        | Performance, relationships   |
| **Reusable patterns** | Custom hooks         | Consistency, maintainability |
| **Modern Next.js**    | App Router APIs      | Future-proof, performance    |

## 🔧 Error Handling Strategy

All data fetching approaches use our centralized error handling system:

### **Error Classification**

- **User Errors (4xx)**: Show specific, actionable messages
- **Server Errors (5xx)**: Show generic, friendly messages
- **Database Errors**: Automatically detected and converted

### **Error Response Format**

```json
{
  "error": "Specific error message",
  "details": "Technical details (development only)",
  "code": "ERROR_CODE"
}
```

### **Internationalization**

- All error messages are translated
- User-friendly messages for different error types
- Technical details only shown in development mode

## 📈 Performance Considerations

### **SSR vs Client-Side**

- **SSR**: Better for initial load, SEO
- **Client-side**: Better for dynamic data, real-time updates

### **API vs Direct Prisma**

- **API**: Better for authentication, validation, error handling
- **Direct Prisma**: Better for performance, complex queries

### **Caching Strategies**

- **Static data**: Use Next.js caching
- **Dynamic data**: Use SWR or React Query
- **Real-time data**: No caching, always fresh

## 🛠 Best Practices

1. **Choose the right approach** based on your specific use case
2. **Use error handling** consistently across all data fetching
3. **Implement loading states** for better user experience
4. **Consider performance** implications of each approach
5. **Use TypeScript** for type safety
6. **Follow RESTful conventions** for API design
7. **Implement proper validation** for all inputs
8. **Log errors** for debugging and monitoring

## 🔄 Migration Guide

### **From Pages Router to App Router**

1. Move API routes from `pages/api/` to `app/api/`
2. Update response format to use `Response` instead of `res.json()`
3. Use server components for initial data loading
4. Implement proper error handling with custom error classes

### **From Basic Fetch to Custom Hooks**

1. Create custom hook with `useErrorHandler`
2. Implement loading states and error handling
3. Add retry logic and user feedback
4. Use internationalized error messages

This guide should help you choose the right data fetching approach for your specific use case and maintain consistency across the application.
