# Global Error Handling System

This document describes the comprehensive error handling system implemented for the frontend application.

## Overview

The error handling system provides a unified approach to handle different types of errors and exceptions that can occur in the application:

| Source                          | Example                     | What User Cares About                        |
| ------------------------------- | --------------------------- | -------------------------------------------- |
| **Network Failure**             | No internet, DNS error      | "Why is nothing loading? Should I retry?"    |
| **Backend (Business) Error**    | Invalid password, 401, 409  | "What exactly went wrong? How can I fix it?" |
| **Backend Navigation Signal**   | `/verify-email` in response | "I need to take action elsewhere."           |
| **Frontend / Unexpected Error** | JS runtime crash, bug       | "App is broken, maybe refresh?"              |

## Architecture

### 1. Error Types (`frontend/src/api/error/types.ts`)

Defines standardized error types and interfaces:

```typescript
export const ErrorType = {
  NETWORK: 'NETWORK',
  BACKEND_BUSINESS: 'BACKEND_BUSINESS', 
  BACKEND_NAVIGATION: 'BACKEND_NAVIGATION',
  FRONTEND_RUNTIME: 'FRONTEND_RUNTIME',
  UNKNOWN: 'UNKNOWN'
} as const;

export interface NormalizedError {
  type: ErrorType;
  code: string;
  message: string;
  details?: string;
  suggestions?: string[];
  navigation?: NavigationControl;
  originalError?: any;
  userFriendlyMessage: string;
  shouldRetry: boolean;
  shouldRefresh: boolean;
}
```

### 2. Error Normalizer (`frontend/src/api/error/normalizer.ts`)

Converts various error types into a standardized `NormalizedError` format:

- **Network Detection**: Identifies connection issues, DNS errors, timeouts
- **Backend Error Processing**: Handles HTTP status codes and extracts navigation signals
- **Frontend Error Handling**: Catches runtime errors and exceptions
- **Navigation Extraction**: Detects and extracts navigation instructions from backend responses

### 3. Error Interceptor (`frontend/src/api/error/interceptor.ts`)

Axios interceptor that automatically handles all API requests and responses:

- **Request Logging**: Tracks request metadata and timing
- **Response Processing**: Checks for navigation signals in successful responses
- **Auto-Retry Logic**: Automatically retries failed requests based on error type
- **Error Normalization**: Converts all errors to standardized format

### 4. Error Handler (`frontend/src/api/error/handler.ts`)

Central error handling logic that takes appropriate actions:

- **Navigation Handling**: Processes backend navigation instructions
- **Authentication Errors**: Automatically redirects to login on 401 errors
- **Error-Specific Logic**: Custom handling for different API endpoints
- **Cache Management**: Clears relevant query cache on auth errors

### 5. Notification System (`frontend/src/api/error/notifications.ts`)

User-facing error notifications:

- **Smart Filtering**: Doesn't show notifications for navigation signals
- **Error Logging**: Comprehensive error logging for debugging
- **User Prompts**: Asks user for refresh on critical errors

## Usage

### Automatic Error Handling

The system is automatically initialized in the router and handles all errors globally:

```typescript
// In router.tsx
function RouterContent() {
  useErrorHandler(); // Initializes global error handling
  return <Routes>...</Routes>;
}
```

### API-Specific Error Handling

For custom error handling in specific components:

```typescript
import { useApiErrorHandler } from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleError } = useApiErrorHandler();
  
  const handleSubmit = async () => {
    try {
      await someApiCall();
    } catch (error) {
      handleError('myApi', error);
    }
  };
}
```

### Navigation Signals

The backend can send navigation instructions in responses:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": { "user": {...} },
  "navigation": {
    "route": "/auth/verify-email",
    "type": "replace",
    "reason": "email_verification_required"
  }
}
```

The frontend automatically processes these and navigates accordingly.

## Error Flow Examples

### 1. Network Error
```
User Action → Network Failure → Normalizer → Handler → Retry Logic → User Notification
```

### 2. Backend Business Error (401)
```
API Call → 401 Response → Normalizer → Handler → Clear Auth Cache → Redirect to Login
```

### 3. Backend Navigation Signal
```
API Call → Success with Navigation → Interceptor → Handler → Navigate to Route
```

### 4. Frontend Runtime Error
```
JS Error → Global Handler → Normalizer → Handler → User Notification with Refresh Option
```

## Configuration

The error handling system can be configured:

```typescript
ErrorInterceptor.configure({
  enableNetworkDetection: true,
  enableAutoRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableLogging: process.env.NODE_ENV === 'development',
  enableUserNotification: true
});
```

## Integration with Backend

The system is designed to work with the nest-backend which sends standardized responses:

```typescript
// Backend response format
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  navigation?: NavigationControl;
  error?: {
    code: string;
    details: string;
    suggestions?: string[];
  };
}
```

## Benefits

1. **Consistent Error Handling**: All errors are processed through the same pipeline
2. **Automatic Navigation**: Backend controls frontend navigation flow
3. **User-Friendly Messages**: Technical errors are converted to user-friendly messages
4. **Automatic Retries**: Network errors are automatically retried
5. **Debug Information**: Comprehensive logging for development
6. **Type Safety**: Full TypeScript support with proper type definitions

## Development

- All error handling is logged to console in development mode
- The system includes test components for validating error scenarios
- Error boundaries can be added for component-level error handling

## Production Considerations

- Logging is automatically disabled in production
- User notifications are simplified and user-friendly
- Sensitive error details are not exposed to users
- Automatic retry logic helps with transient network issues

This error handling system provides a robust foundation for handling all types of errors in a user-friendly and developer-friendly way while maintaining tight integration with the backend navigation system.