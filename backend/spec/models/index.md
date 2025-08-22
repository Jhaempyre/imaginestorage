# Models Overview

This document provides an overview of all database models in the imaginaryStorage application.

## 📊 Model Architecture

The application uses **2 main entities** with a simple relationship structure:

```
User (1) ──────── (*) File
     │
     └── Authentication & Profile Management
```

## 🗃️ Available Models

| Model | File | Purpose | Key Features |
|-------|------|---------|--------------|
| **User** | [`user.md`](./user.md) | Authentication & Profile | Password hashing, email verification, tokens |
| **File** | [`file.md`](./file.md) | File Storage & Metadata | Multi-cloud storage, sharing, access control |

## 🔗 Model Relationships

### User → File (One-to-Many)
- **Relationship**: One user can have multiple files
- **Reference**: Files contain `userId` field referencing User `_id`
- **Indexing**: Optimized queries with compound indexes
- **Cascade**: Files are soft-deleted when users are deactivated

## 📋 Common Patterns

### Timestamps
All models include automatic timestamps:
```typescript
{
  createdAt: Date;    // Auto-generated on creation
  updatedAt: Date;    // Auto-updated on modification
}
```

### Soft Deletion
Models support soft deletion pattern:
```typescript
{
  isDeleted: boolean;     // Default: false
  deletedAt?: Date;       // Set when isDeleted = true
}
```

### Security Fields
Sensitive fields are excluded from JSON serialization:
```typescript
// Hidden in API responses
select: false
```

## 🔧 Database Configuration

- **Database Name**: `imaginaryStorage`
- **Connection**: MongoDB via Mongoose ODM
- **Connection File**: [`../database/connection.md`](../database/connection.md)

## 📈 Performance Optimizations

### Indexing Strategy
- **Single Field Indexes**: High-frequency query fields
- **Compound Indexes**: Multi-field query patterns
- **Text Indexes**: Full-text search capabilities
- **Sparse Indexes**: Optional unique fields

### Query Patterns
- **Pagination**: Built-in support for efficient pagination
- **Population**: Optimized relationship loading
- **Projection**: Selective field loading

## 🛡️ Security Measures

### Data Protection
- **Password Hashing**: PBKDF2 with SHA-512
- **Token Security**: Cryptographically secure random tokens
- **Field Validation**: Comprehensive input validation
- **Access Control**: Role-based permissions

### Privacy
- **Data Sanitization**: Automatic removal of sensitive fields
- **Audit Trail**: Timestamp tracking for all operations
- **Soft Deletion**: Data recovery capabilities

## 📚 Usage Examples

### Model Import
```typescript
import { User, File, IUser, IFile } from '../src/models';
```

### Basic Operations
```typescript
// Create
const user = new User({ username: 'john', email: 'john@example.com' });
await user.save();

// Read
const users = await User.find({ isActive: true });

// Update
await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

// Delete (soft)
await User.findByIdAndUpdate(userId, { isDeleted: true, deletedAt: new Date() });
```

## 🔄 Migration Guidelines

When modifying models:
1. **Update TypeScript interfaces** first
2. **Add/modify Mongoose schema** fields
3. **Update validation rules** as needed
4. **Add/modify indexes** for performance
5. **Update documentation** in respective model files
6. **Test thoroughly** with existing data

## 📖 Related Documentation

- [User Model Specification](./user.md)
- [File Model Specification](./file.md)
- [Database Connection](../database/connection.md)
- [API Documentation](../api/index.md)
- [Security Guide](../security/index.md)

---

*For detailed information about specific models, see their individual specification files.*