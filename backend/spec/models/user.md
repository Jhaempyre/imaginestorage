# User Model Specification

Complete specification for the User model in the imaginaryStorage application.

## 📋 Overview

**File**: `src/models/user.ts`  
**Purpose**: Manages user authentication, profile information, and account verification  
**Collection**: `users`

## 🏗️ TypeScript Interface

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
  comparePassword(candidatePassword: string): boolean;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}
```

## 📊 Schema Fields

### Required Fields

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `username` | String | 3-30 chars, alphanumeric + underscore | Unique user identifier |
| `email` | String | Valid email format, lowercase | User's email address |
| `password` | String | Min 6 chars, hashed with PBKDF2 | User's password (hashed) |

### Optional Profile Fields

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `firstName` | String | - | Max 50 chars | User's first name |
| `lastName` | String | - | Max 50 chars | User's last name |
| `avatar` | String | `null` | - | Profile picture URL/path |

### Authentication Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isEmailVerified` | Boolean | `false` | Email verification status |
| `emailVerificationToken` | String | - | Token for email verification (hidden) |
| `passwordResetToken` | String | - | Token for password reset (hidden) |
| `passwordResetExpires` | Date | - | Password reset token expiry (hidden) |
| `lastLogin` | Date | `null` | Last successful login timestamp |
| `isActive` | Boolean | `true` | Account active status |

### System Fields

| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last modification timestamp |

## 🔐 Security Implementation

### Password Hashing
```typescript
// Uses Node.js crypto module with PBKDF2
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
this.password = salt + ':' + hash;
```

**Security Features**:
- **Algorithm**: PBKDF2 with SHA-512
- **Iterations**: 10,000 (computationally expensive)
- **Salt**: 16-byte random salt per password
- **Storage**: `salt:hash` format

### Password Verification
```typescript
// Timing-safe comparison to prevent timing attacks
const [salt, storedHash] = this.password.split(':');
const candidateHash = crypto.pbkdf2Sync(candidatePassword, salt, 10000, 64, 'sha512').toString('hex');
return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
```

### Token Generation
```typescript
// Cryptographically secure random tokens
const token = crypto.randomBytes(32).toString('hex');
```

## 📇 Database Indexes

### Performance Indexes
```typescript
userSchema.index({ email: 1 });        // Login queries
userSchema.index({ username: 1 });     // Username lookups
userSchema.index({ isActive: 1 });     // Active user filtering
```

### Unique Constraints
- `username`: Unique across all users
- `email`: Unique across all users

## 🔧 Middleware

### Pre-save Middleware
```typescript
userSchema.pre('save', function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  // Hash password with crypto
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(this.password, salt, 10000, 64, 'sha512').toString('hex');
  this.password = salt + ':' + hash;
  next();
});
```

### JSON Transform
```typescript
toJSON: {
  transform: function(doc, ret) {
    // Remove sensitive fields from API responses
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  }
}
```

## 🛠️ Instance Methods

### comparePassword()
```typescript
user.comparePassword(candidatePassword: string): boolean
```
- **Purpose**: Verify user password during login
- **Security**: Uses timing-safe comparison
- **Returns**: `true` if password matches, `false` otherwise

### generateEmailVerificationToken()
```typescript
user.generateEmailVerificationToken(): string
```
- **Purpose**: Generate token for email verification
- **Security**: 32-byte cryptographically secure random token
- **Side Effect**: Sets `emailVerificationToken` field
- **Returns**: Generated token string

### generatePasswordResetToken()
```typescript
user.generatePasswordResetToken(): string
```
- **Purpose**: Generate token for password reset
- **Security**: 32-byte cryptographically secure random token
- **Side Effects**: 
  - Sets `passwordResetToken` field
  - Sets `passwordResetExpires` to 10 minutes from now
- **Returns**: Generated token string

## 📝 Usage Examples

### User Registration
```typescript
import { User } from '../models';

const user = new User({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'securepassword123',
  firstName: 'John',
  lastName: 'Doe'
});

await user.save();
console.log('User created:', user.username);
```

### User Login
```typescript
const user = await User.findOne({ email: 'john@example.com' }).select('+password');

if (user && user.comparePassword('securepassword123')) {
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  console.log('Login successful');
} else {
  console.log('Invalid credentials');
}
```

### Email Verification
```typescript
// Generate verification token
const user = await User.findById(userId);
const token = user.generateEmailVerificationToken();
await user.save();

// Send email with token...

// Verify email
const userToVerify = await User.findOne({ emailVerificationToken: token });
if (userToVerify) {
  userToVerify.isEmailVerified = true;
  userToVerify.emailVerificationToken = undefined;
  await userToVerify.save();
}
```

### Password Reset
```typescript
// Generate reset token
const user = await User.findOne({ email: 'john@example.com' });
const resetToken = user.generatePasswordResetToken();
await user.save();

// Send email with reset link...

// Reset password
const userToReset = await User.findOne({
  passwordResetToken: resetToken,
  passwordResetExpires: { $gt: Date.now() }
});

if (userToReset) {
  userToReset.password = 'newpassword123';
  userToReset.passwordResetToken = undefined;
  userToReset.passwordResetExpires = undefined;
  await userToReset.save();
}
```

### User Profile Update
```typescript
const user = await User.findById(userId);
user.firstName = 'Jane';
user.lastName = 'Smith';
user.avatar = '/uploads/avatars/jane-smith.jpg';
await user.save();
```

## 🔍 Query Examples

### Find Active Users
```typescript
const activeUsers = await User.find({ isActive: true });
```

### Find Users by Name
```typescript
const users = await User.find({
  $or: [
    { firstName: { $regex: 'John', $options: 'i' } },
    { lastName: { $regex: 'John', $options: 'i' } }
  ]
});
```

### Get User with Files Count
```typescript
const userWithStats = await User.aggregate([
  { $match: { _id: mongoose.Types.ObjectId(userId) } },
  {
    $lookup: {
      from: 'files',
      localField: '_id',
      foreignField: 'userId',
      as: 'files'
    }
  },
  {
    $addFields: {
      filesCount: { $size: '$files' }
    }
  },
  {
    $project: {
      files: 0,
      password: 0,
      emailVerificationToken: 0,
      passwordResetToken: 0,
      passwordResetExpires: 0
    }
  }
]);
```

## ⚠️ Security Considerations

### Password Security
- **Never store plain text passwords**
- **Use strong hashing algorithm** (PBKDF2 with high iteration count)
- **Generate unique salt** for each password
- **Use timing-safe comparison** for password verification

### Token Security
- **Generate cryptographically secure tokens**
- **Set appropriate expiration times**
- **Invalidate tokens after use**
- **Store tokens securely** (exclude from API responses)

### Data Privacy
- **Exclude sensitive fields** from JSON serialization
- **Validate all input data**
- **Sanitize user input**
- **Implement proper access controls**

## 🔄 Migration Notes

When updating the User model:
1. **Backup existing data** before schema changes
2. **Test password hashing** with existing passwords
3. **Update API endpoints** that use User model
4. **Update authentication middleware**
5. **Test all user flows** (registration, login, password reset)

## 📚 Related Documentation

- [Models Overview](./index.md)
- [File Model](./file.md)
- [Authentication API](../api/authentication.md)
- [Security Guide](../security/authentication.md)
- [Database Connection](../database/connection.md)

---

*This specification covers the complete User model implementation including security measures, usage patterns, and best practices.*