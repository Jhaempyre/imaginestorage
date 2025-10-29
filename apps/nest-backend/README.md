# NestJS ImaginaryStorage Backend

A comprehensive file storage and management API built with NestJS, featuring multi-provider cloud storage, authentication, and file sharing capabilities.

## 🚀 Features

### ✅ **Authentication & Authorization**
- JWT-based authentication with access/refresh tokens
- Cookie-based token storage
- Email verification
- Password reset functionality
- Protected routes with guards

### ✅ **File Management**
- File upload with validation (type, size)
- File download with signed URLs
- File sharing with expirable tokens
- Public/private file visibility
- Soft delete functionality
- File metadata and search

### ✅ **Storage Providers**
- AWS S3 integration (implemented)
- Multi-provider architecture (ready for GCP, Azure, Local)
- Runtime provider switching
- Health monitoring

### ✅ **API Documentation**
- Swagger/OpenAPI documentation
- Request/response validation with class-validator
- Comprehensive API examples

### ✅ **Database**
- MongoDB with Mongoose ODM
- Optimized schemas with indexes
- Aggregation pipelines for analytics

## 🏗️ Architecture

```
src/
├── modules/
│   ├── auth/           # Authentication & JWT
│   ├── users/          # User management
│   ├── files/          # File operations
│   └── storage/        # Storage providers
├── schemas/            # MongoDB schemas
├── common/
│   ├── dto/           # Data transfer objects
│   ├── guards/        # Auth guards
│   └── interfaces/    # TypeScript interfaces
└── config/            # Configuration
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
# Edit .env file with your settings
```

## ⚙️ Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/imaginary-storage

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_access_token
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# File Upload
MAX_FILE_SIZE=50MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,video/mp4

# AWS Storage
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Security
BCRYPT_SALT_ROUNDS=12
```

## 🚀 Running the Application

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Watch mode
npm run start:debug
```

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # Login user
POST   /api/auth/logout             # Logout user
POST   /api/auth/refresh-token      # Refresh access token
GET    /api/auth/me                 # Get current user
POST   /api/auth/change-password    # Change password
POST   /api/auth/verify-email       # Verify email
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password
```

### Users
```
GET    /api/users/profile           # Get user profile
PUT    /api/users/profile           # Update user profile
PUT    /api/users/avatar            # Update user avatar
DELETE /api/users/account           # Delete user account
GET    /api/users/stats             # Get user statistics
GET    /api/users/files             # Get user files
GET    /api/users/search            # Search users
```

### Files
```
POST   /api/files/upload            # Upload file
GET    /api/files                   # Get user files (paginated)
GET    /api/files/:id               # Get file details
GET    /api/files/:id/download      # Get download URL
POST   /api/files/:id/share         # Generate share link
PATCH  /api/files/:id/visibility    # Update file visibility
DELETE /api/files/:id               # Delete file

# Public endpoints
GET    /api/files/public/:id        # Get public file
GET    /api/files/public/:id/download # Download public file
GET    /api/files/shared/:token     # Get shared file
GET    /api/files/shared/:token/download # Download shared file
```

### Storage
```
GET    /api/storage/status          # Get storage status
GET    /api/storage/providers       # Get available providers
GET    /api/storage/health          # Health check
POST   /api/storage/switch          # Switch storage provider
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "SecurePassword123!"
  }'
```

### Upload File
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "isPublic=false"
```

### Get Files
```bash
curl -X GET "http://localhost:3000/api/files?page=1&limit=10&search=document" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Development

### Adding New Storage Provider

1. Create provider class implementing `IStorageProvider`:
```typescript
// src/modules/storage/providers/gcp-storage.provider.ts
@Injectable()
export class GCPStorageProvider implements IStorageProvider {
  // Implement interface methods
}
```

2. Register in StorageService:
```typescript
// src/modules/storage/storage.service.ts
constructor() {
  this.registerProvider('gcp', new GCPStorageProvider());
}
```

### Custom Validation

```typescript
// src/common/dto/custom.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CustomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customField?: string;
}
```

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure MongoDB connection
- Set up AWS credentials
- Configure CORS origins
- Set secure JWT secrets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

- [ ] Google Cloud Storage provider
- [ ] Azure Blob Storage provider
- [ ] Local file storage provider
- [ ] File compression and optimization
- [ ] Image thumbnail generation
- [ ] Video processing
- [ ] Email notifications
- [ ] Rate limiting per user
- [ ] File versioning
- [ ] Bulk operations
- [ ] Admin dashboard
- [ ] File analytics and insights