# Revised User-Driven Storage Provider Flow Specification

## 🎯 **Overview**

This specification defines a user-centric storage provider selection system where each user chooses their own storage provider and provides credentials. Storage is initialized per-user, on-demand, with **backend-controlled frontend navigation**.

## 🔄 **Complete User Flow**

```mermaid
graph TD
    A[User Registration] --> B[Email Verification]
    B --> C[Login]
    C --> D{Onboarding Complete?}
    D -->|No| E[Onboarding Step 1: Choose Provider]
    E --> F[Onboarding Step 2: Provider Credentials]
    F --> G[Validate Credentials]
    G -->|Valid| H[Dashboard Access]
    G -->|Invalid| I[Show Error & Retry]
    I --> F
    D -->|Yes| H[Dashboard Access]
    H --> J[File Operations]
    J --> K[Initialize User Storage]
    K --> L[Perform Operation]
```

## 📋 **Detailed Flow Specification**

### **Phase 1: Authentication**
1. **User Registration** → Basic user info + navigate to email verification
2. **Email Verification** → Verify email + navigate to onboarding
3. **Login** → JWT authentication + navigate based on user state

### **Phase 2: Onboarding (Simplified)**
4. **Choose Storage Provider** → Select from available providers (AWS, GCP, Azure, Local)
5. **Provide Credentials** → Enter provider-specific credentials + validate
6. **Complete Onboarding** → Mark user as onboarded + navigate to dashboard

### **Phase 3: Dashboard Access**
7. **Dashboard Access** → Full application functionality
8. **File Operations** → Upload, download, share files
9. **Storage Management** → View/update credentials (no provider change)

## 🗄️ **Database Schema Design**

### **Updated User Schema**
```typescript
@Schema({ timestamps: true })
export class User {
  // Existing fields...
  @Prop({ required: true, trim: true, maxlength: 50 })
  firstName: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true, maxlength: 30 })
  username: string;

  @Prop({ required: true, minlength: 8 })
  password: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  // New onboarding fields
  @Prop({ default: false })
  isOnboardingComplete: boolean;

  @Prop({ default: null })
  onboardingCompletedAt: Date;

  // Existing fields...
  @Prop({ default: null })
  avatar: string;

  @Prop({ default: null })
  emailVerificationToken: string;

  @Prop({ default: null })
  emailVerificationExpiry: Date;

  @Prop({ default: null })
  passwordResetToken: string;

  @Prop({ default: null })
  passwordResetExpiry: Date;

  @Prop({ default: null })
  refreshToken: string;

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: null })
  deletedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

### **New UserStorageConfig Schema**
```typescript
@Schema({ timestamps: true })
export class UserStorageConfig {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ 
    required: true,
    enum: ['aws', 'gcp', 'azure', 'local'],
  })
  provider: string;

  @Prop({ required: true, type: Object })
  credentials: {
    // AWS
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    bucketName?: string;
    
    // GCP
    projectId?: string;
    keyFile?: string; // Base64 encoded key file
    bucketName?: string;
    
    // Azure
    accountName?: string;
    accountKey?: string;
    containerName?: string;
    
    // Local
    storagePath?: string;
  };

  @Prop({ default: false })
  isValidated: boolean;

  @Prop({ default: null })
  lastValidatedAt: Date;

  @Prop({ default: null })
  validationError: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}
```

## 🗺️ **Frontend Route Management**

### **Defined Frontend Routes**
```typescript
// Authentication Routes
/login                    // User login
/register                 // User registration  
/verify-email            // Email verification
/forgot-password         // Password reset request
/reset-password          // Password reset form

// Onboarding Routes
/onboarding/step-1       // Choose storage provider
/onboarding/step-2       // Configure credentials

// Main Application Routes
/dashboard               // Main dashboard
/dashboard/files         // File management
/dashboard/settings      // User settings
/dashboard/storage       // Storage configuration

// Error Routes
/error                   // Generic error page
/unauthorized           // 401 error page
/forbidden              // 403 error page
```

### **Navigation Control Response Format**
```typescript
interface NavigationControl {
  route: string;           // Target route to navigate to
  type: 'push' | 'replace'; // Navigation type
  reason?: string;         // Optional reason for navigation
  params?: object;         // Optional route parameters
  state?: object;          // Optional state to pass
}
```

### **Navigation Types**
- **`push`**: Add new route to history stack (user can go back)
- **`replace`**: Replace current route in history (user cannot go back)

## 🔌 **API Endpoints Specification**

### **1. Authentication APIs (Updated with Navigation)**

#### **POST /api/auth/register**
```typescript
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!"
}

// Response
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "isEmailVerified": false,
      "isOnboardingComplete": false
    },
    "accessToken": "jwt_token"
  },
  "navigation": {
    "route": "/verify-email",
    "type": "replace",
    "reason": "email_verification_required"
  }
}
```

#### **POST /api/auth/verify-email**
```typescript
// Request
{
  "token": "verification_token"
}

// Response
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "isEmailVerified": true,
      "isOnboardingComplete": false
    }
  },
  "navigation": {
    "route": "/onboarding/step-1",
    "type": "replace",
    "reason": "onboarding_required"
  }
}
```

#### **POST /api/auth/login**
```typescript
// Response (onboarding required)
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "isEmailVerified": true,
      "isOnboardingComplete": false
    },
    "accessToken": "jwt_token"
  },
  "navigation": {
    "route": "/onboarding/step-1",
    "type": "replace",
    "reason": "onboarding_required"
  }
}

// Response (onboarding complete)
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "isEmailVerified": true,
      "isOnboardingComplete": true
    },
    "accessToken": "jwt_token"
  },
  "navigation": {
    "route": "/dashboard",
    "type": "replace"
  }
}

// Response (email not verified)
{
  "success": true,
  "message": "Please verify your email address",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "isEmailVerified": false,
      "isOnboardingComplete": false
    },
    "accessToken": "jwt_token"
  },
  "navigation": {
    "route": "/verify-email",
    "type": "replace",
    "reason": "email_verification_required"
  }
}
```

### **2. Onboarding APIs (Updated with Navigation)**

#### **GET /api/onboarding/status**
```typescript
// Response (Step 1 - Choose Provider)
{
  "success": true,
  "message": "Onboarding status retrieved",
  "data": {
    "isOnboardingComplete": false,
    "currentStep": "choose_provider",
    "hasStorageConfig": false,
    "availableProviders": [
      {
        "id": "aws",
        "name": "Amazon S3",
        "description": "Amazon Simple Storage Service",
        "features": ["Global CDN", "99.999999999% durability", "Lifecycle policies"],
        "requiredFields": ["accessKeyId", "secretAccessKey", "region", "bucketName"]
      },
      {
        "id": "gcp",
        "name": "Google Cloud Storage",
        "description": "Google Cloud Platform Storage",
        "features": ["Global network", "Strong consistency", "IAM integration"],
        "requiredFields": ["projectId", "keyFile", "bucketName"]
      },
      {
        "id": "azure",
        "name": "Azure Blob Storage",
        "description": "Microsoft Azure Blob Storage",
        "features": ["Hot/Cool/Archive tiers", "Azure integration", "Geo-redundancy"],
        "requiredFields": ["accountName", "accountKey", "containerName"]
      },
      {
        "id": "local",
        "name": "Local Storage",
        "description": "Local file system storage",
        "features": ["No external dependencies", "Full control", "No bandwidth costs"],
        "requiredFields": ["storagePath"]
      }
    ]
  },
  "navigation": {
    "route": "/onboarding/step-1",
    "type": "replace"
  }
}

// Response (Already Completed)
{
  "success": true,
  "message": "Onboarding already completed",
  "data": {
    "isOnboardingComplete": true,
    "currentStep": "completed",
    "hasStorageConfig": true,
    "storageProvider": "aws"
  },
  "navigation": {
    "route": "/dashboard",
    "type": "replace"
  }
}
```

#### **POST /api/onboarding/choose-provider**
```typescript
// Request
{
  "provider": "aws"
}

// Response
{
  "success": true,
  "message": "Storage provider selected",
  "data": {
    "provider": "aws",
    "requiredFields": [
      {
        "name": "accessKeyId",
        "label": "AWS Access Key ID",
        "type": "text",
        "required": true,
        "description": "Your AWS access key ID from IAM"
      },
      {
        "name": "secretAccessKey",
        "label": "AWS Secret Access Key",
        "type": "password",
        "required": true,
        "description": "Your AWS secret access key from IAM"
      },
      {
        "name": "region",
        "label": "AWS Region",
        "type": "select",
        "required": true,
        "options": ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"],
        "description": "AWS region for your S3 bucket"
      },
      {
        "name": "bucketName",
        "label": "S3 Bucket Name",
        "type": "text",
        "required": true,
        "description": "Name of your S3 bucket (will be created if doesn't exist)"
      }
    ]
  },
  "navigation": {
    "route": "/onboarding/step-2",
    "type": "push"
  }
}
```

#### **POST /api/onboarding/configure-credentials**
```typescript
// Request (AWS example)
{
  "credentials": {
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1",
    "bucketName": "my-app-storage"
  }
}

// Response (Success)
{
  "success": true,
  "message": "Storage credentials configured and validated successfully",
  "data": {
    "provider": "aws",
    "isValidated": true,
    "validatedAt": "2024-01-15T10:30:00Z",
    "storageInfo": {
      "bucketName": "my-app-storage",
      "region": "us-east-1",
      "permissions": ["read", "write", "delete"]
    },
    "user": {
      "isOnboardingComplete": true,
      "onboardingCompletedAt": "2024-01-15T10:30:00Z"
    }
  },
  "navigation": {
    "route": "/dashboard",
    "type": "replace",
    "reason": "onboarding_completed"
  }
}

// Response (Validation Error)
{
  "success": false,
  "message": "Storage credentials validation failed",
  "error": {
    "code": "INVALID_CREDENTIALS",
    "details": "Access denied: Invalid AWS credentials or insufficient permissions",
    "suggestions": [
      "Verify your AWS Access Key ID and Secret Access Key",
      "Ensure the IAM user has S3 permissions",
      "Check if the bucket exists and is accessible"
    ]
  },
  "navigation": {
    "route": "/onboarding/step-2",
    "type": "replace",
    "reason": "validation_failed"
  }
}
```

### **3. Storage Management APIs (Simplified - No Provider Changes)**

#### **GET /api/storage/config**
```typescript
// Response
{
  "success": true,
  "message": "Storage configuration retrieved",
  "data": {
    "provider": "aws",
    "isValidated": true,
    "lastValidatedAt": "2024-01-15T10:30:00Z",
    "credentials": {
      "accessKeyId": "AKIA***EXAMPLE", // Masked
      "region": "us-east-1",
      "bucketName": "my-app-storage"
      // secretAccessKey not returned for security
    },
    "storageStats": {
      "totalFiles": 25,
      "totalSize": "1.2 GB",
      "lastActivity": "2024-01-15T09:45:00Z"
    }
  }
}
```

#### **PUT /api/storage/config**
```typescript
// Request (Update credentials only, not provider)
{
  "credentials": {
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-west-2",
    "bucketName": "my-new-bucket"
  }
}

// Response
{
  "success": true,
  "message": "Storage configuration updated and validated",
  "data": {
    "provider": "aws",
    "isValidated": true,
    "validatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### **POST /api/storage/validate**
```typescript
// Response
{
  "success": true,
  "message": "Storage configuration validated",
  "data": {
    "isValid": true,
    "validatedAt": "2024-01-15T11:05:00Z",
    "permissions": ["read", "write", "delete"],
    "storageInfo": {
      "bucketName": "my-app-storage",
      "region": "us-east-1",
      "availableSpace": "unlimited"
    }
  }
}
```

#### **DELETE /api/storage/config**
```typescript
// Response (Reset onboarding)
{
  "success": true,
  "message": "Storage configuration removed successfully",
  "data": {
    "user": {
      "isOnboardingComplete": false
    }
  },
  "navigation": {
    "route": "/onboarding/step-1",
    "type": "replace",
    "reason": "storage_reset"
  }
}
```

### **4. Updated File APIs**

#### **POST /api/files/upload**
```typescript
// Response (updated with user storage)
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "id": "file_id",
      "originalName": "document.pdf",
      "fileName": "user123/1642234567890-document.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "storageProvider": "aws", // User's configured provider
      "storageLocation": "s3://user-bucket/user123/1642234567890-document.pdf",
      "isPublic": false,
      "createdAt": "2024-01-15T11:10:00Z"
    },
    "storageInfo": {
      "provider": "aws",
      "region": "us-east-1",
      "bucket": "user-bucket"
    }
  }
}
```

## 🔧 **Backend Navigation Service**

### **Navigation Helper Service**
```typescript
@Injectable()
export class NavigationService {
  
  // Determine navigation based on user state
  getNavigationForUser(user: User): NavigationControl {
    if (!user.isEmailVerified) {
      return {
        route: '/verify-email',
        type: 'replace',
        reason: 'email_verification_required'
      };
    }
    
    if (!user.isOnboardingComplete) {
      return {
        route: '/onboarding/step-1',
        type: 'replace',
        reason: 'onboarding_required'
      };
    }
    
    return {
      route: '/dashboard',
      type: 'replace'
    };
  }
  
  // Navigation for onboarding steps
  getOnboardingNavigation(step: string, success: boolean = true): NavigationControl {
    if (!success) {
      return {
        route: `/onboarding/${step}`,
        type: 'replace',
        reason: 'validation_failed'
      };
    }
    
    switch (step) {
      case 'step-1':
        return {
          route: '/onboarding/step-2',
          type: 'push'
        };
      case 'step-2':
        return {
          route: '/dashboard',
          type: 'replace',
          reason: 'onboarding_completed'
        };
      default:
        return {
          route: '/onboarding/step-1',
          type: 'replace'
        };
    }
  }
  
  // Error navigation
  getErrorNavigation(errorType: string): NavigationControl {
    switch (errorType) {
      case 'unauthorized':
        return {
          route: '/login',
          type: 'replace',
          reason: 'session_expired'
        };
      case 'forbidden':
        return {
          route: '/unauthorized',
          type: 'replace'
        };
      default:
        return {
          route: '/error',
          type: 'replace'
        };
    }
  }
}
```

### **Response Wrapper with Navigation**
```typescript
export class ApiResponseWithNavigation<T> {
  success: boolean;
  message: string;
  data: T;
  navigation?: NavigationControl;
  
  constructor(
    statusCode: number,
    data: T,
    message: string,
    navigation?: NavigationControl
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.navigation = navigation;
  }
}
```

### **Common Navigation Scenarios**
```typescript
// After successful login (onboarding required)
{
  "navigation": {
    "route": "/onboarding/step-1",
    "type": "replace",
    "reason": "onboarding_required"
  }
}

// After successful login (onboarding complete)
{
  "navigation": {
    "route": "/dashboard",
    "type": "replace"
  }
}

// Moving through onboarding steps
{
  "navigation": {
    "route": "/onboarding/step-2",
    "type": "push"
  }
}

// After onboarding completion
{
  "navigation": {
    "route": "/dashboard",
    "type": "replace",
    "reason": "onboarding_completed"
  }
}

// Error scenarios
{
  "navigation": {
    "route": "/onboarding/step-2",
    "type": "replace",
    "reason": "validation_failed"
  }
}
```

## 🏗️ **Implementation Architecture**

### **1. User Storage Service**
```typescript
@Injectable()
export class UserStorageService {
  async getUserStorageConfig(userId: string): Promise<UserStorageConfig>;
  async createStorageConfig(userId: string, config: CreateStorageConfigDto): Promise<UserStorageConfig>;
  async updateStorageConfig(userId: string, config: UpdateStorageConfigDto): Promise<UserStorageConfig>;
  async validateStorageConfig(config: UserStorageConfig): Promise<ValidationResult>;
  async getStorageProvider(userId: string): Promise<IStorageProvider>;
  async initializeUserStorage(userId: string): Promise<IStorageProvider>;
  async deleteStorageConfig(userId: string): Promise<void>;
}
```

### **2. Dynamic Storage Provider Factory**
```typescript
@Injectable()
export class StorageProviderFactory {
  createProvider(config: UserStorageConfig): IStorageProvider {
    switch (config.provider) {
      case 'aws':
        return new AWSStorageProvider(config.credentials);
      case 'gcp':
        return new GCPStorageProvider(config.credentials);
      case 'azure':
        return new AzureStorageProvider(config.credentials);
      case 'local':
        return new LocalStorageProvider(config.credentials);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }
}
```

### **3. Onboarding Guard**
```typescript
@Injectable()
export class OnboardingGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Allow access to onboarding endpoints
    if (request.url.startsWith('/api/onboarding')) {
      return true;
    }
    
    // Require onboarding completion for other endpoints
    if (!user.isOnboardingComplete) {
      throw new ForbiddenException('Onboarding required');
    }
    
    return true;
  }
}
```

## 🔒 **Security Considerations**

### **1. Credential Storage**
- **Encryption**: All credentials encrypted at rest
- **Access Control**: Only user can access their credentials
- **Masking**: Sensitive fields masked in API responses
- **No Migration**: Simpler security model without data migration

### **2. Validation**
- **Real-time Validation**: Test credentials before saving
- **Permission Checks**: Verify required permissions
- **Error Handling**: Secure error messages without credential exposure

### **3. Audit Trail**
- **Configuration Changes**: Log all storage config changes
- **Access Logs**: Track storage provider access
- **Validation History**: Keep validation attempt history

## 📊 **Simplified Migration Strategy**

### **Existing Users**
1. **Add onboarding fields** to existing users (default: incomplete)
2. **Prompt for onboarding** on next login with proper navigation
3. **No data migration** - users start fresh with their chosen provider

### **No Provider Changes**
- Users choose once during onboarding
- No provider switching or migration features
- Simpler architecture and user experience
- Storage config can be deleted to restart onboarding

This revised specification provides complete backend control over frontend navigation while maintaining a clean, user-driven storage provider selection system without complex migration features! 🚀