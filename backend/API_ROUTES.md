# API Routes Documentation

Complete API routing structure for the imaginaryStorage application.

## 🌐 Base URL
```
http://localhost:8000/api
```

## 📋 Route Structure

### Root Endpoints
- `GET /` - API welcome message and endpoint overview
- `GET /api/health` - Health check endpoint
- `GET /api/version` - API version information
- `GET /api/docs` - API documentation

---

## 🔐 Authentication Routes (`/api/auth`)

### User Registration & Login
| Method | Endpoint | Description | Access | Rate Limit |
|--------|----------|-------------|--------|------------|
| `POST` | `/api/auth/register` | Register new user | Public | 10/15min |
| `POST` | `/api/auth/login` | User login | Public | 5/15min |
| `POST` | `/api/auth/logout` | User logout | Private | - |

**Register Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Token Management
| Method | Endpoint | Description | Access | Rate Limit |
|--------|----------|-------------|--------|------------|
| `POST` | `/api/auth/refresh-token` | Refresh access token | Public | - |
| `GET` | `/api/auth/me` | Get current user | Private | - |

### Email Verification
| Method | Endpoint | Description | Access | Rate Limit |
|--------|----------|-------------|--------|------------|
| `POST` | `/api/auth/verify-email` | Verify email address | Public | - |
| `POST` | `/api/auth/resend-verification` | Resend verification email | Public | 3/hour |

**Email Verification Request:**
```json
{
  "token": "verification_token_here"
}
```

### Password Management
| Method | Endpoint | Description | Access | Rate Limit |
|--------|----------|-------------|--------|------------|
| `POST` | `/api/auth/forgot-password` | Request password reset | Public | 3/hour |
| `POST` | `/api/auth/reset-password` | Reset password with token | Public | - |
| `POST` | `/api/auth/change-password` | Change password | Private | - |

**Password Reset Request:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```

**Change Password Request:**
```json
{
  "oldPassword": "currentPassword",
  "newPassword": "newSecurePassword123"
}
```

---

## 👤 User Management Routes (`/api/users`)

### Profile Management
| Method | Endpoint | Description | Access | Rate Limit |
|--------|----------|-------------|--------|------------|
| `GET` | `/api/users/profile` | Get user profile with stats | Private | - |
| `PUT` | `/api/users/profile` | Update user profile | Private | - |
| `PUT` | `/api/users/avatar` | Update user avatar | Private | - |
| `DELETE` | `/api/users/account` | Delete user account | Private | - |

**Update Profile Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith"
}
```

**Update Avatar Request:**
```json
{
  "avatar": "/uploads/avatars/user-avatar.jpg"
}
```

### User Analytics
| Method | Endpoint | Description | Access | Rate Limit |
|--------|----------|-------------|--------|------------|
| `GET` | `/api/users/stats` | Get user statistics | Private | - |
| `GET` | `/api/users/files` | Get user files with pagination | Private | - |

**Files Query Parameters:**
```
?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=document&mimeType=image&tags=work,important
```

### Admin Functions
| Method | Endpoint | Description | Access | Rate Limit |
|--------|----------|-------------|--------|------------|
| `GET` | `/api/users/search` | Search users (Admin) | Private | 50/hour |

---

## 🔒 Authentication Methods

### JWT Bearer Token
```http
Authorization: Bearer <access_token>
```

### Cookie-based Authentication
```http
Cookie: accessToken=<token>; refreshToken=<refresh_token>
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Detailed error messages"],
  "stack": "Error stack (development only)"
}
```

---

## 🚦 Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Registration | 10 requests | 15 minutes |
| Login | 5 requests | 15 minutes |
| Email Verification | 3 requests | 1 hour |
| Password Reset | 3 requests | 1 hour |
| User Search | 50 requests | 1 hour |

---

## 🔧 Middleware Stack

### Global Middleware (Applied to all routes)
1. **CORS** - Cross-origin resource sharing
2. **Body Parser** - JSON and URL-encoded parsing
3. **Cookie Parser** - Cookie handling
4. **Security Headers** - XSS, CSRF protection
5. **Request Logging** - Development logging

### Route-specific Middleware
1. **verifyJWT** - JWT token verification
2. **requireEmailVerification** - Email verification check
3. **rateLimitByUser** - User-based rate limiting
4. **validateRequest** - Request body validation

---

## 🧪 Testing Examples

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer <access_token>"
```

### Get User Files
```bash
curl -X GET "http://localhost:8000/api/users/files?page=1&limit=5" \
  -H "Authorization: Bearer <access_token>"
```

---

## 🔄 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 📝 Notes

1. **Authentication Required**: Routes marked as "Private" require valid JWT token
2. **Email Verification**: Some routes require verified email address
3. **Rate Limiting**: Limits are per user for authenticated routes, per IP for public routes
4. **Pagination**: List endpoints support pagination with `page` and `limit` parameters
5. **Filtering**: File endpoints support filtering by MIME type, tags, and search terms
6. **Sorting**: List endpoints support sorting with `sortBy` and `sortOrder` parameters

---

*This documentation covers all available API routes and their usage patterns for the imaginaryStorage application.*