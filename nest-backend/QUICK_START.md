# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ 
- MongoDB running locally or connection string
- AWS account with S3 bucket (optional for testing)

## 1. Installation
```bash
cd nest-backend
npm install
```

## 2. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum required variables:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/imaginary-storage
ACCESS_TOKEN_SECRET=your_super_secret_access_token_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_here

# Optional AWS (for file storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
```

## 3. Start the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 4. Test the API
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 5. Quick Test

### Register a User
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

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### Upload File (replace YOUR_TOKEN)
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

## 🎉 You're Ready!

The NestJS backend is now running with the same functionality as the Express version but with:
- ✅ **Better architecture** with modules and dependency injection
- ✅ **Built-in validation** with decorators
- ✅ **Swagger documentation** out of the box
- ✅ **Type safety** throughout the application
- ✅ **Enterprise-ready** structure

Visit the **Swagger documentation** at http://localhost:3000/api/docs to explore all available endpoints! 🚀