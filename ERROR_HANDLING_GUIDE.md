# Error Handling Strategy Guide

## Overview

This guide explains the comprehensive error handling strategy implemented to distinguish between user errors (4xx) and server errors (5xx) in your medical application.

## Key Principles

1. **User Errors (4xx)**: Show specific, actionable messages to help users fix the issue
2. **Server Errors (5xx)**: Show generic, friendly messages without technical details
3. **Internationalization**: All error messages support multiple languages (EN, FR, AR)
4. **Consistent UX**: Uniform error display across the application
5. **Developer Experience**: Detailed error logging in development mode

## Architecture

### 1. Error Classes (`src/utils/errorHandler.ts`)

The system provides specialized error classes for different scenarios:

```typescript
// User Errors (4xx)
UserError // Generic user error
ValidationError // Form validation errors
AuthenticationError // 401 Unauthorized
AuthorizationError // 403 Forbidden
NotFoundError // 404 Not Found
ConflictError // 409 Conflict

// Server Errors (5xx)
ServerError // Generic server error
DatabaseError // Database connection issues
NetworkError // Network connectivity problems
TimeoutError // Request timeout
```

### 2. Error Classification Functions

```typescript
isUserError(status) // Returns true for 4xx status codes
isServerError(status) // Returns true for 5xx status codes
isNetworkError(error) // Detects network-related errors
isDatabaseError(error) // Detects database-related errors
isTimeoutError(error) // Detects timeout errors
```

### 3. React Hook (`src/hooks/useErrorHandler.ts`)

Provides error handling functionality for React components:

```typescript
const {
  error, // Current error state
  isLoading, // Loading state
  handleError, // Handle errors manually
  handleAsyncOperation, // Wrapper for async operations
  clearError // Clear current error
} = useErrorHandler({
  showUserErrors: true, // Show user error messages
  showServerErrors: true, // Show server error messages
  logErrors: true, // Log errors for debugging
  context: 'ComponentName' // Context for logging
})
```

### 4. Error Display Component (`src/components/ErrorDisplay.tsx`)

Reusable component for displaying errors with appropriate styling:

```typescript
<ErrorDisplay
  error={error}
  onRetry={() => retryOperation()}
  onDismiss={() => clearError()}
  showDetails={process.env.NODE_ENV === 'development'}
/>
```

## Usage Examples

### Example 1: Basic Error Handling in Component

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler'
import ErrorDisplay from '@/components/ErrorDisplay'

const MyComponent = () => {
  const { error, isLoading, handleAsyncOperation, clearError } = useErrorHandler()

  const fetchData = async () => {
    await handleAsyncOperation(
      async () => {
        const response = await fetch('/api/data')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        return await response.json()
      },
      {
        onSuccess: (data) => {
          console.log('Data loaded:', data)
        },
        onError: (error) => {
          console.log('Error occurred:', error)
        }
      }
    )
  }

  return (
    <div>
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={fetchData}
          onDismiss={clearError}
        />
      )}
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Load Data'}
      </button>
    </div>
  )
}
```

### Example 2: API Route Error Handling

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server'
import { UserError, ServerError, formatErrorResponse } from '@/utils/errorHandler'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.email) {
      throw new UserError('Email is required')
    }

    if (!body.email.includes('@')) {
      throw new UserError('Invalid email format')
    }

    // Process data
    const result = await processData(body)

    return NextResponse.json(result)
  } catch (error) {
    // Log error for debugging
    console.error('API Error:', error)

    if (error instanceof UserError) {
      return NextResponse.json(formatErrorResponse(error), { status: error.status })
    }

    // Server errors get generic messages
    return NextResponse.json(formatErrorResponse(new ServerError()), { status: 500 })
  }
}
```

### Example 3: Form Validation

```typescript
import { ValidationError } from '@/utils/errorHandler'

const validateForm = (data: any) => {
  const errors = []

  if (!data.name) {
    errors.push(new ValidationError('Name is required'))
  }

  if (!data.email) {
    errors.push(new ValidationError('Email is required'))
  } else if (!data.email.includes('@')) {
    errors.push(new ValidationError('Invalid email format'))
  }

  if (errors.length > 0) {
    throw errors[0] // Throw first error
  }
}
```

### Example 4: Using Fetch Utility

```typescript
import { fetchWithErrorHandling } from '@/utils/errorHandler'

const loadData = async () => {
  try {
    const data = await fetchWithErrorHandling('/api/data')
    return data
  } catch (error) {
    // Error is already classified and formatted
    throw error
  }
}
```

## Error Messages by Language

### English (en.json)

```json
{
  "errors": {
    "userError": {
      "title": "Action Required",
      "message": "Please check your input and try again"
    },
    "serverError": {
      "title": "Service Temporarily Unavailable",
      "message": "We're experiencing technical difficulties. Please try again later."
    },
    "network": {
      "title": "Connection Error",
      "message": "Unable to connect to the server. Please check your internet connection and try again."
    }
  }
}
```

### French (fr.json)

```json
{
  "errors": {
    "userError": {
      "title": "Action Requise",
      "message": "Veuillez vérifier vos données et réessayer"
    },
    "serverError": {
      "title": "Service Temporairement Indisponible",
      "message": "Nous rencontrons des difficultés techniques. Veuillez réessayer plus tard."
    }
  }
}
```

### Arabic (ar.json)

```json
{
  "errors": {
    "userError": {
      "title": "إجراء مطلوب",
      "message": "يرجى التحقق من بياناتك والمحاولة مرة أخرى"
    },
    "serverError": {
      "title": "الخدمة غير متاحة مؤقتاً",
      "message": "نواجه صعوبات تقنية. يرجى المحاولة مرة أخرى لاحقاً."
    }
  }
}
```

## Best Practices

### 1. Always Use the Error Handler Hook

```typescript
// ✅ Good
const { error, handleAsyncOperation } = useErrorHandler()

// ❌ Bad
const [error, setError] = useState(null)
```

### 2. Provide Specific User Error Messages

```typescript
// ✅ Good
throw new UserError('Please enter a valid email address')

// ❌ Bad
throw new Error('Invalid input')
```

### 3. Use Generic Messages for Server Errors

```typescript
// ✅ Good
throw new ServerError() // Uses generic message

// ❌ Bad
throw new ServerError('Database connection failed: P2002') // Exposes technical details
```

### 4. Log Errors in Development

```typescript
// ✅ Good
const { handleError } = useErrorHandler({ logErrors: true })

// ❌ Bad
console.error('Error:', error) // Manual logging
```

### 5. Handle Loading States

```typescript
// ✅ Good
const { isLoading, handleAsyncOperation } = useErrorHandler()

return (
  <button disabled={isLoading} onClick={handleSubmit}>
    {isLoading ? 'Saving...' : 'Save'}
  </button>
)

// ❌ Bad
const [loading, setLoading] = useState(false)
```

## Migration Guide

### From Old Error Handling

**Before:**

```typescript
const [error, setError] = useState(null)

const handleSubmit = async () => {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      setError('An error occurred')
    }
  } catch (err) {
    setError('Network error')
  }
}
```

**After:**

```typescript
const { error, handleAsyncOperation } = useErrorHandler()

const handleSubmit = async () => {
  await handleAsyncOperation(async () => {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new UserError('Failed to save data')
    }
    return await response.json()
  })
}
```

## Testing Error Scenarios

### 1. User Error Testing

```typescript
// Test validation errors
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ email: 'invalid-email' })
})
// Should return 400 with specific validation message
```

### 2. Server Error Testing

```typescript
// Test database errors
const response = await fetch('/api/data')
// Should return 500 with generic message
```

### 3. Network Error Testing

```typescript
// Test offline scenarios
// Disconnect network and make API calls
// Should show network error message
```

## Troubleshooting

### Common Issues

1. **Error messages not translated**: Ensure error keys exist in all language files
2. **Errors not showing**: Check that `showUserErrors` or `showServerErrors` is enabled
3. **Loading state stuck**: Ensure `handleAsyncOperation` is used correctly
4. **Error details not showing**: Check `showDetails` prop and `NODE_ENV`

### Debug Mode

In development, errors show additional details:

- Error stack traces
- Technical error codes
- Debug information

In production, only user-friendly messages are shown.

## Conclusion

This error handling strategy provides:

- ✅ Clear distinction between user and server errors
- ✅ Consistent user experience across the application
- ✅ Internationalization support
- ✅ Developer-friendly debugging
- ✅ Type-safe error handling
- ✅ Reusable components and utilities

By following this guide, you'll create a robust, user-friendly error handling system that improves both user experience and developer productivity.
