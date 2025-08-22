# Mongoose Models Specification

This document provides a comprehensive specification for the Mongoose models implemented in the imaginaryStorage application.

## Overview

The application uses two main entities:
- **User**: Represents application users with authentication and profile information
- **File**: Handles file storage, metadata, and access control

## Database Configuration

- **Database Name**: `imaginaryStorage` (defined in `constants.ts`)
- **Connection**: MongoDB via Mongoose ODM
- **Connection File**: `src/db/database.ts`

---

## 1. User Model (`src/models/user.ts`)

### Purpose
Manages user authentication, profile information, and account verification.

### Interface: `IUser`
```typescript
interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}
```

### Schema Fields

| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|------------|
| `username` | String | ✓ | ✓ | - | 3-30 chars, alphanumeric + underscore |
| `email` | String | ✓ | ✓ | - | Valid email format, lowercase |
| `password` | String | ✓ | - | - | Min 6 chars, hashed with PBKDF2 |
| `firstName` | String | - | - | - | Max 50 chars |
| `lastName` | String | - | - | - | Max 50 chars |
| `avatar` | String | - | - | `null` | File path or URL |
| `isEmailVerified` | Boolean | - | - | `false` | - |
| `emailVerificationToken` | String | - | - | - | Hidden in queries |
| `passwordResetToken` | String | - | - | - | Hidden in queries |
| `passwordResetExpires` | Date | - | - | - | Hidden in queries |
| `lastLogin` | Date | - | - | `null` | - |
| `isActive` | Boolean | - | - | `true` | - |

### Indexes
- `email` (single field)
- `username` (single field)
- `isActive` (single field)

### Middleware
- **Pre-save**: Automatically hashes password using Node.js crypto (PBKDF2 with SHA-512, 10,000 iterations)
- **toJSON**: Removes sensitive fields from JSON output

### Instance Methods
- `comparePassword(candidatePassword: string)`: Compares plain text password with hashed password using timing-safe comparison
- `generateEmailVerificationToken()`: Generates and sets email verification token
- `generatePasswordResetToken()`: Generates password reset token with 10-minute expiry

### Security Features
- Password hashing with Node.js crypto (PBKDF2 with SHA-512, 10,000 iterations)
- Sensitive fields excluded from JSON serialization
- Email verification system
- Password reset with expiration

---

## 2. File Model (`src/models/file.ts`)

### Purpose
Manages file storage, metadata, sharing, and access control with comprehensive tracking.

### Interface: `IFile`
```typescript
interface IFile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  fileHash: string;
  thumbnailPath?: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  shareToken?: string;
  shareExpiry?: Date;
  downloadCount: number;
  lastDownloaded?: Date;
  metadata: MetadataObject;
  uploadProgress: number;
  uploadStatus: UploadStatus;
  processingStatus: ProcessingStatus;
  storageProvider: StorageProvider;
  storageLocation: string;
  backupLocation?: string;
  encryption: EncryptionObject;
  virus: VirusObject;
  access: AccessObject;
  expiryDate?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Schema Fields

#### Core File Information
| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|------------|
| `userId` | ObjectId | ✓ | - | - | References User model |
| `originalName` | String | ✓ | - | - | Max 255 chars |
| `fileName` | String | ✓ | ✓ | - | Max 255 chars |
| `filePath` | String | ✓ | - | - | - |
| `fileSize` | Number | ✓ | - | - | Min: 0 (bytes) |
| `mimeType` | String | ✓ | - | - | Lowercase |
| `fileExtension` | String | ✓ | - | - | Max 10 chars, lowercase |
| `fileHash` | String | ✓ | ✓ | - | For deduplication |

#### File Metadata and Organization
| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `thumbnailPath` | String | - | `null` | - |
| `description` | String | - | - | Max 1000 chars |
| `tags` | String[] | - | `[]` | Max 20 tags |

#### Sharing and Access
| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `isPublic` | Boolean | - | `false` | - |
| `shareToken` | String | - | - | Unique, sparse |
| `shareExpiry` | Date | - | `null` | - |
| `downloadCount` | Number | - | `0` | Min: 0 |
| `lastDownloaded` | Date | - | `null` | - |

#### Upload and Processing
| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `uploadProgress` | Number | - | `0` | 0-100 |
| `uploadStatus` | String | - | `'pending'` | Enum: pending, uploading, completed, failed, cancelled |
| `processingStatus` | String | - | `'pending'` | Enum: pending, processing, completed, failed |

#### Storage Configuration
| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `storageProvider` | String | - | `'local'` | Enum: local, aws, gcp, azure |
| `storageLocation` | String | ✓ | - | - |
| `backupLocation` | String | - | `null` | - |

#### Security Objects

**Encryption Object:**
```typescript
encryption: {
  isEncrypted: boolean;    // Default: false
  algorithm?: string;      // Default: null
  keyId?: string;         // Default: null
}
```

**Virus Scanning Object:**
```typescript
virus: {
  isScanned: boolean;     // Default: false
  isClean: boolean;       // Default: false
  scanDate?: Date;        // Default: null
  scanEngine?: string;    // Default: null
}
```

**Access Control Object:**
```typescript
access: {
  canView: boolean;       // Default: true
  canDownload: boolean;   // Default: true
  canShare: boolean;      // Default: true
  canDelete: boolean;     // Default: true
}
```

#### File Lifecycle
| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `expiryDate` | Date | - | `null` | - |
| `isDeleted` | Boolean | - | `false` | - |
| `deletedAt` | Date | - | `null` | - |

### Indexes

#### Single Field Indexes
- `userId`
- `fileHash`
- `shareToken`
- `isPublic`
- `uploadStatus`
- `processingStatus`
- `expiryDate`
- `isDeleted`

#### Compound Indexes
- `{ userId: 1, isDeleted: 1 }`
- `{ userId: 1, uploadStatus: 1 }`
- `{ userId: 1, mimeType: 1 }`
- `{ shareToken: 1, shareExpiry: 1 }`

#### Special Indexes
- **Text Index**: `{ originalName: 'text', description: 'text', tags: 'text' }` for search functionality
- **Date Indexes**: `createdAt: -1`, `fileSize: 1`

### Middleware

#### Pre-save Middleware
1. **Share Token Generation**: Automatically generates share token when `isPublic` is set to true
2. **Soft Delete**: Sets `deletedAt` timestamp when `isDeleted` is set to true

### Instance Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `generateShareToken(expiryHours?)` | Generates share token with optional expiry | `string` |
| `isShareTokenValid()` | Checks if share token is valid and not expired | `boolean` |
| `isExpired()` | Checks if file has expired | `boolean` |
| `getFileUrl()` | Returns file access URL | `string` |
| `getThumbnailUrl()` | Returns thumbnail URL if available | `string \| null` |

### Static Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `findByUser()` | Finds non-deleted files by user | `userId`, `options` |
| `findPublicFiles()` | Finds public, non-deleted files | `options` |

---

## Model Relationships

### User → File (1:Many)
- Users can have multiple files
- Files reference user via `userId`
- Indexed for efficient queries

### Data Flow
1. User registers → User document created
2. User uploads files → File documents created with userId reference

---

## Usage Examples

### Creating a User
```typescript
import { User } from './src/models';

// Create user
const user = new User({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'securepassword'
});
await user.save();
```

### File Upload
```typescript
import { File } from './src/models';

// Create file
const file = new File({
  userId,
  originalName: 'document.pdf',
  fileName: 'unique-file-name.pdf',
  filePath: '/uploads/unique-file-name.pdf',
  fileSize: 1024000,
  mimeType: 'application/pdf',
  fileExtension: 'pdf',
  fileHash: 'sha256hash...'
});
await file.save();
```

### User Authentication
```typescript
import { User } from './src/models';

// Login user
const user = await User.findOne({ email: 'john@example.com' }).select('+password');
if (user && user.comparePassword('candidatepassword')) {
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  console.log('Login successful');
} else {
  console.log('Invalid credentials');
}
```

---

## Security Considerations

1. **Password Security**: PBKDF2 hashing with SHA-512, 10,000 iterations, and random salt
2. **Data Sanitization**: Input validation and sanitization on all fields
3. **File Security**: Virus scanning support, encryption options
4. **Access Control**: Granular permissions per file
5. **Token Security**: Secure random token generation for sharing
6. **Soft Deletes**: Files are soft-deleted for recovery options

---

## Performance Optimizations

1. **Strategic Indexing**: Compound indexes for common query patterns
2. **Text Search**: Full-text search on file names, descriptions, and tags
3. **Pagination Support**: Built-in support for efficient pagination
4. **Query Optimization**: Selective field loading and population

---

## Environment Variables Required

```env
MONGODB_URI=mongodb://localhost:27017
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

This specification provides a comprehensive overview of the Mongoose models implemented for the imaginaryStorage application, including their relationships, validation rules, and usage patterns.

## Notes

- The Account model has been removed from this implementation
- User management and file storage are handled directly through User and File models
- Authentication uses Node.js crypto module instead of external dependencies