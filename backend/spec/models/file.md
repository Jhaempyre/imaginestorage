# File Model Specification

Complete specification for the File model in the imaginaryStorage application.

## 📋 Overview

**File**: `src/models/file.ts`  
**Purpose**: Manages file storage, metadata, sharing, and access control  
**Collection**: `files`

## 🏗️ TypeScript Interface

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

## 📊 Schema Fields

### Core File Information

| Field | Type | Required | Unique | Validation | Description |
|-------|------|----------|--------|------------|-------------|
| `userId` | ObjectId | ✓ | - | References User | File owner |
| `originalName` | String | ✓ | - | Max 255 chars | Original filename |
| `fileName` | String | ✓ | ✓ | Max 255 chars | Unique system filename |
| `filePath` | String | ✓ | - | - | File storage path |
| `fileSize` | Number | ✓ | - | Min: 0 | File size in bytes |
| `mimeType` | String | ✓ | - | Lowercase | MIME type |
| `fileExtension` | String | ✓ | - | Max 10 chars, lowercase | File extension |
| `fileHash` | String | ✓ | ✓ | - | SHA-256 hash for deduplication |

### File Metadata

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `thumbnailPath` | String | `null` | - | Thumbnail file path |
| `description` | String | - | Max 1000 chars | User description |
| `tags` | String[] | `[]` | Max 20 tags | File tags for organization |

### Sharing and Access

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `isPublic` | Boolean | `false` | - | Public access flag |
| `shareToken` | String | - | Unique, sparse | Share token for public access |
| `shareExpiry` | Date | `null` | - | Share token expiration |
| `downloadCount` | Number | `0` | Min: 0 | Download counter |
| `lastDownloaded` | Date | `null` | - | Last download timestamp |

### Upload and Processing

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `uploadProgress` | Number | `0` | 0-100 | Upload progress percentage |
| `uploadStatus` | String | `'pending'` | Enum | Upload status |
| `processingStatus` | String | `'pending'` | Enum | Processing status |

### Storage Configuration

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `storageProvider` | String | `'local'` | Enum | Storage provider |
| `storageLocation` | String | ✓ | - | Provider-specific location |
| `backupLocation` | String | `null` | - | Backup storage location |

### File Lifecycle

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `expiryDate` | Date | `null` | File expiration date |
| `isDeleted` | Boolean | `false` | Soft delete flag |
| `deletedAt` | Date | `null` | Deletion timestamp |

## 🔧 Enums and Types

### Upload Status
```typescript
type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';
```

### Processing Status
```typescript
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

### Storage Provider
```typescript
type StorageProvider = 'local' | 'aws' | 'gcp' | 'azure';
```

## 📦 Nested Objects

### Metadata Object
```typescript
metadata: {
  width?: number;           // Image/video width
  height?: number;          // Image/video height
  duration?: number;        // Video/audio duration (seconds)
  bitrate?: number;         // Media bitrate
  codec?: string;           // Media codec
  [key: string]: any;       // Additional metadata
}
```

### Encryption Object
```typescript
encryption: {
  isEncrypted: boolean;     // Default: false
  algorithm?: string;       // Encryption algorithm
  keyId?: string;          // Key identifier
}
```

### Virus Scanning Object
```typescript
virus: {
  isScanned: boolean;       // Default: false
  isClean: boolean;         // Default: false
  scanDate?: Date;          // Scan timestamp
  scanEngine?: string;      // Scanner used
}
```

### Access Control Object
```typescript
access: {
  canView: boolean;         // Default: true
  canDownload: boolean;     // Default: true
  canShare: boolean;        // Default: true
  canDelete: boolean;       // Default: true
}
```

## 📇 Database Indexes

### Single Field Indexes
```typescript
fileSchema.index({ userId: 1 });
fileSchema.index({ fileHash: 1 });
fileSchema.index({ shareToken: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ uploadStatus: 1 });
fileSchema.index({ processingStatus: 1 });
fileSchema.index({ expiryDate: 1 });
fileSchema.index({ isDeleted: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ fileSize: 1 });
fileSchema.index({ tags: 1 });
```

### Compound Indexes
```typescript
fileSchema.index({ userId: 1, isDeleted: 1 });
fileSchema.index({ userId: 1, uploadStatus: 1 });
fileSchema.index({ userId: 1, mimeType: 1 });
fileSchema.index({ shareToken: 1, shareExpiry: 1 });
```

### Text Search Index
```typescript
fileSchema.index({
  originalName: 'text',
  description: 'text',
  tags: 'text'
});
```

## 🔧 Middleware

### Pre-save Middleware

#### Share Token Generation
```typescript
fileSchema.pre('save', function(next) {
  if (this.isModified('isPublic') && this.isPublic && !this.shareToken) {
    const crypto = require('crypto');
    this.shareToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});
```

#### Soft Delete Timestamp
```typescript
fileSchema.pre('save', function(next) {
  if (this.isModified('isDeleted') && this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  next();
});
```

## 🛠️ Instance Methods

### generateShareToken()
```typescript
file.generateShareToken(expiryHours: number = 24): string
```
- **Purpose**: Generate secure share token with expiry
- **Parameters**: `expiryHours` - Token validity period (default: 24 hours)
- **Returns**: Generated share token
- **Side Effects**: Sets `shareToken` and `shareExpiry` fields

### isShareTokenValid()
```typescript
file.isShareTokenValid(): boolean
```
- **Purpose**: Check if share token is valid and not expired
- **Returns**: `true` if valid, `false` otherwise

### isExpired()
```typescript
file.isExpired(): boolean
```
- **Purpose**: Check if file has expired
- **Returns**: `true` if expired, `false` otherwise

### getFileUrl()
```typescript
file.getFileUrl(): string
```
- **Purpose**: Get file access URL
- **Returns**: File URL based on storage provider

### getThumbnailUrl()
```typescript
file.getThumbnailUrl(): string | null
```
- **Purpose**: Get thumbnail URL if available
- **Returns**: Thumbnail URL or `null`

## 🔍 Static Methods

### findByUser()
```typescript
File.findByUser(userId: ObjectId, options?: any): Query
```
- **Purpose**: Find non-deleted files by user
- **Parameters**: `userId`, `options` (pagination, sorting)
- **Returns**: Mongoose query

### findPublicFiles()
```typescript
File.findPublicFiles(options?: any): Query
```
- **Purpose**: Find public, non-deleted files
- **Parameters**: `options` (pagination, sorting)
- **Returns**: Mongoose query

## 📝 Usage Examples

### File Upload
```typescript
import { File } from '../models';
import crypto from 'crypto';

// Calculate file hash
const fileBuffer = fs.readFileSync(filePath);
const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

const file = new File({
  userId: user._id,
  originalName: 'document.pdf',
  fileName: `${Date.now()}-document.pdf`,
  filePath: '/uploads/documents/document.pdf',
  fileSize: fileBuffer.length,
  mimeType: 'application/pdf',
  fileExtension: 'pdf',
  fileHash,
  storageProvider: 'local',
  storageLocation: '/uploads/documents/',
  uploadStatus: 'completed',
  processingStatus: 'completed'
});

await file.save();
```

### File Sharing
```typescript
// Make file public with share token
const file = await File.findById(fileId);
file.isPublic = true;
const shareToken = file.generateShareToken(48); // 48 hours
await file.save();

console.log(`Share URL: /share/${shareToken}`);
```

### File Search
```typescript
// Text search
const files = await File.find({
  $text: { $search: 'presentation slides' },
  userId: user._id,
  isDeleted: false
});

// Filter by type
const images = await File.find({
  userId: user._id,
  mimeType: { $regex: '^image/' },
  isDeleted: false
});
```

### File Statistics
```typescript
// User storage usage
const stats = await File.aggregate([
  { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
  {
    $group: {
      _id: null,
      totalFiles: { $sum: 1 },
      totalSize: { $sum: '$fileSize' },
      avgSize: { $avg: '$fileSize' }
    }
  }
]);
```

### File Cleanup
```typescript
// Find expired files
const expiredFiles = await File.find({
  expiryDate: { $lt: new Date() },
  isDeleted: false
});

// Soft delete expired files
await File.updateMany(
  { expiryDate: { $lt: new Date() }, isDeleted: false },
  { isDeleted: true, deletedAt: new Date() }
);
```

## 🔐 Security Considerations

### File Validation
- **File size limits** based on user account type
- **MIME type validation** against allowed types
- **File extension verification** matches MIME type
- **Virus scanning** before storage

### Access Control
- **User ownership** verification for all operations
- **Share token validation** for public access
- **Permission checks** before file operations
- **Rate limiting** for uploads/downloads

### Storage Security
- **File hash verification** for integrity
- **Encryption support** for sensitive files
- **Secure file paths** to prevent traversal attacks
- **Backup verification** for critical files

## ⚡ Performance Optimizations

### Query Optimization
- **Compound indexes** for common query patterns
- **Selective field loading** with projection
- **Pagination support** for large result sets
- **Aggregation pipelines** for complex queries

### Storage Optimization
- **File deduplication** using hash comparison
- **Thumbnail generation** for images/videos
- **Compression** for applicable file types
- **CDN integration** for faster delivery

## 🔄 Migration Notes

When updating the File model:
1. **Test file upload/download** flows
2. **Verify index performance** with large datasets
3. **Update storage provider** integrations
4. **Test file sharing** functionality
5. **Validate security measures**

## 📚 Related Documentation

- [Models Overview](./index.md)
- [User Model](./user.md)
- [File Management API](../api/files.md)
- [Security Guide](../security/index.md)
- [Database Connection](../database/connection.md)

---

*This specification covers the complete File model implementation including storage management, security measures, and performance optimizations.*