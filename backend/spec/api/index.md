# API Documentation Overview

Complete REST API documentation for the imaginaryStorage application.

## 📋 API Overview

The imaginaryStorage API provides endpoints for user authentication and file management with a RESTful design pattern.

### Base Information
- **Base URL**: `http://localhost:3000/api/v1`
- **Protocol**: HTTP/HTTPS
- **Format**: JSON
- **Authentication**: JWT Bearer tokens

## 🚀 Quick Start

### Authentication Flow
1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login`
3. **Use Token**: Include `Authorization: Bearer <token>` in headers
4. **Refresh**: `POST /auth/refresh` (if implemented)

### File Operations
1. **Upload**: `POST /files/upload`
2. **List**: `GET /files`
3. **Download**: `GET /files/:id/download`
4. **Share**: `POST /files/:id/share`

## 📚 API Endpoints

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | User registration | ❌ |
| `POST` | `/auth/login` | User login | ❌ |
| `POST` | `/auth/logout` | User logout | ✅ |
| `POST` | `/auth/refresh` | Refresh token | ✅ |
| `POST` | `/auth/forgot-password` | Request password reset | ❌ |
| `POST` | `/auth/reset-password` | Reset password | ❌ |
| `POST` | `/auth/verify-email` | Verify email address | ❌ |

### User Profile Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users/profile` | Get user profile | ✅ |
| `PUT` | `/users/profile` | Update user profile | ✅ |
| `POST` | `/users/avatar` | Upload avatar | ✅ |
| `DELETE` | `/users/account` | Delete user account | ✅ |

### File Management Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/files/upload` | Upload file | ✅ |
| `GET` | `/files` | List user files | ✅ |
| `GET` | `/files/:id` | Get file details | ✅ |
| `PUT` | `/files/:id` | Update file metadata | ✅ |
| `DELETE` | `/files/:id` | Delete file | ✅ |
| `GET` | `/files/:id/download` | Download file | ✅ |
| `POST` | `/files/:id/share` | Generate share link | ✅ |
| `GET` | `/share/:token` | Access shared file | ❌ |

### File Search and Organization
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/files/search` | Search files | ✅ |
| `GET` | `/files/tags` | Get all tags | ✅ |
| `GET` | `/files/stats` | Get storage statistics | ✅ |

## 🔐 Authentication

### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "64a7b8c9d1e2f3a4b5c6d7e8",
    "email": "user@example.com",
    "iat": 1623456789,
    "exp": 1623543189
  }
}
```

### Authorization Header
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Request/Response Format

### Standard Response Structure
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2023-12-01T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2023-12-01T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## 📊 Status Codes

### Success Codes
- `200` - OK (GET, PUT requests)
- `201` - Created (POST requests)
- `204` - No Content (DELETE requests)

### Client Error Codes
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Missing/invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Duplicate resource)
- `422` - Unprocessable Entity (Validation errors)
- `429` - Too Many Requests (Rate limiting)

### Server Error Codes
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable
- `504` - Gateway Timeout

## 🔄 Pagination

### Query Parameters
```http
GET /files?page=1&limit=20&sort=createdAt&order=desc
```

### Response Format
```json
{
  "success": true,
  "data": {
    "files": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## 🔍 Filtering and Sorting

### File Filtering
```http
GET /files?mimeType=image/*&tags=vacation,photos&size_gte=1024&size_lte=5242880
```

### Sorting Options
```http
GET /files?sort=createdAt&order=desc
GET /files?sort=fileSize&order=asc
GET /files?sort=downloadCount&order=desc
```

### Search
```http
GET /files/search?q=presentation&type=document&tags=work
```

## 📤 File Upload

### Multipart Form Data
```http
POST /files/upload
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Type: application/pdf

[binary data]
--boundary
Content-Disposition: form-data; name="description"

Important document
--boundary
Content-Disposition: form-data; name="tags"

work,document,important
--boundary--
```

### Upload Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "id": "64a7b8c9d1e2f3a4b5c6d7e8",
      "originalName": "document.pdf",
      "fileName": "1701234567890-document.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "uploadStatus": "completed",
      "createdAt": "2023-12-01T10:30:00Z"
    }
  }
}
```

## 🔗 File Sharing

### Generate Share Link
```http
POST /files/:id/share
Content-Type: application/json

{
  "expiryHours": 24,
  "allowDownload": true
}
```

### Share Response
```json
{
  "success": true,
  "data": {
    "shareToken": "abc123def456ghi789",
    "shareUrl": "https://api.example.com/share/abc123def456ghi789",
    "expiresAt": "2023-12-02T10:30:00Z"
  }
}
```

## ⚠️ Rate Limiting

### Limits by Endpoint Type
- **Authentication**: 5 requests per minute
- **File Upload**: 10 requests per hour
- **File Download**: 100 requests per hour
- **General API**: 1000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623456789
```

## 🛡️ Security Headers

### Required Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## 📋 API Versioning

### URL Versioning
```http
GET /api/v1/files
GET /api/v2/files  # Future version
```

### Header Versioning (Alternative)
```http
GET /api/files
Accept: application/vnd.imaginarystorage.v1+json
```

## 🧪 Testing

### Example cURL Commands
```bash
# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Upload file
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "description=Test document"

# List files
curl -X GET http://localhost:3000/api/v1/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Detailed Documentation

For detailed endpoint specifications, see:
- [Authentication API](./authentication.md) - Complete auth endpoint documentation
- [File Management API](./files.md) - Complete file endpoint documentation

## 🔄 Changelog

### Version 1.0.0
- Initial API release
- User authentication endpoints
- File management endpoints
- Basic sharing functionality

---

*This overview provides a comprehensive guide to the imaginaryStorage API. For detailed endpoint specifications, refer to the individual API documentation files.*