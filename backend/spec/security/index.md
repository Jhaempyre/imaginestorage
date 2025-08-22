# Security Overview

Comprehensive security measures and best practices for the imaginaryStorage application.

## 🛡️ Security Architecture

### Defense in Depth Strategy
The application implements multiple layers of security:
1. **Network Security** - Firewall, HTTPS, VPN
2. **Application Security** - Authentication, authorization, input validation
3. **Data Security** - Encryption, hashing, secure storage
4. **Infrastructure Security** - Secure deployment, monitoring

## 🔐 Authentication Security

### Password Security
- **Algorithm**: PBKDF2 with SHA-512
- **Iterations**: 10,000 (computationally expensive)
- **Salt**: 16-byte cryptographically secure random salt per password
- **Storage Format**: `salt:hash` (hex encoded)

```typescript
// Password hashing implementation
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
const hashedPassword = salt + ':' + hash;
```

### Password Verification
```typescript
// Timing-safe comparison to prevent timing attacks
const [salt, storedHash] = storedPassword.split(':');
const candidateHash = crypto.pbkdf2Sync(candidatePassword, salt, 10000, 64, 'sha512').toString('hex');
return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
```

### Token Security
- **Generation**: 32-byte cryptographically secure random tokens
- **Usage**: Email verification, password reset, file sharing
- **Expiration**: Time-based expiry for all tokens
- **Single Use**: Tokens invalidated after use

## 🔑 JWT Implementation

### Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_id",
    "email": "user@example.com",
    "iat": 1623456789,
    "exp": 1623543189
  }
}
```

### Security Considerations
- **Secret Key**: Strong, randomly generated secret
- **Algorithm**: HMAC SHA-256 (HS256)
- **Expiration**: Short-lived tokens (15 minutes - 1 hour)
- **Refresh Tokens**: Longer-lived for token renewal
- **Blacklisting**: Token revocation capability

## 🔒 Data Protection

### Sensitive Data Handling
```typescript
// Automatic exclusion from API responses
toJSON: {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  }
}
```

### Database Security
```typescript
// Hidden fields in queries
emailVerificationToken: {
  type: String,
  select: false  // Excluded from queries by default
}
```

## 🛡️ Input Validation

### Request Validation
- **Schema Validation**: Mongoose schema validation
- **Type Checking**: TypeScript compile-time checks
- **Sanitization**: Input sanitization for XSS prevention
- **Rate Limiting**: Request throttling per endpoint

### File Upload Security
```typescript
// File validation example
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxFileSize = 50 * 1024 * 1024; // 50MB

if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new Error('File type not allowed');
}

if (file.size > maxFileSize) {
  throw new Error('File size exceeds limit');
}
```

## 🔐 File Security

### File Access Control
```typescript
// Access control object
access: {
  canView: boolean;       // View file metadata
  canDownload: boolean;   // Download file content
  canShare: boolean;      // Generate share links
  canDelete: boolean;     // Delete file
}
```

### File Integrity
- **Hash Verification**: SHA-256 hash for each file
- **Deduplication**: Prevent duplicate file storage
- **Virus Scanning**: Integration with antivirus engines
- **Encryption**: Optional file encryption at rest

### Secure File Sharing
```typescript
// Share token generation
generateShareToken(expiryHours: number = 24): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.shareToken = token;
  this.shareExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
  return token;
}
```

## 🌐 Network Security

### HTTPS Configuration
```typescript
// Express HTTPS setup
const httpsOptions = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(httpsOptions, app).listen(443);
```

### Security Headers
```typescript
// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## 🚫 Rate Limiting

### Implementation Strategy
```typescript
// Rate limiting by endpoint type
const authLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 5,                   // 5 requests per minute
  message: 'Too many authentication attempts'
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                  // 10 uploads per hour
  message: 'Upload limit exceeded'
});
```

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1623456789
Retry-After: 60
```

## 🔍 Security Monitoring

### Audit Logging
```typescript
// Security event logging
const securityLogger = {
  loginAttempt: (email, success, ip) => {
    console.log(`Login attempt: ${email}, Success: ${success}, IP: ${ip}`);
  },
  fileAccess: (userId, fileId, action, ip) => {
    console.log(`File access: User ${userId}, File ${fileId}, Action: ${action}, IP: ${ip}`);
  },
  suspiciousActivity: (event, details) => {
    console.warn(`Security alert: ${event}`, details);
  }
};
```

### Intrusion Detection
- **Failed Login Monitoring**: Track failed authentication attempts
- **Unusual Access Patterns**: Monitor for suspicious file access
- **Rate Limit Violations**: Alert on repeated limit violations
- **File Upload Anomalies**: Detect unusual upload patterns

## 🛡️ Error Handling

### Secure Error Messages
```typescript
// Don't expose sensitive information
try {
  const user = await User.findOne({ email });
  if (!user || !user.comparePassword(password)) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'  // Generic message
      }
    });
  }
} catch (error) {
  // Log detailed error internally
  logger.error('Login error:', error);
  
  // Return generic error to client
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An error occurred during login'
    }
  });
}
```

## 🔐 Environment Security

### Environment Variables
```env
# Secure configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database security
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/imaginaryStorage

# File storage
UPLOAD_PATH=/secure/uploads
MAX_FILE_SIZE=52428800

# Email security
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Production Security Checklist
- [ ] Strong JWT secret (minimum 32 characters)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database authentication enabled
- [ ] File upload directory outside web root
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] File type and size restrictions

## 🔄 Security Updates

### Regular Security Tasks
1. **Dependency Updates**: Regular npm audit and updates
2. **Security Patches**: Apply security patches promptly
3. **Password Policy**: Enforce strong password requirements
4. **Token Rotation**: Regular JWT secret rotation
5. **Access Review**: Regular review of user permissions

### Security Testing
```bash
# Dependency vulnerability scan
npm audit

# Security linting
npm run lint:security

# Penetration testing
npm run test:security
```

## 📋 Compliance Considerations

### Data Privacy
- **GDPR Compliance**: User data rights and deletion
- **Data Minimization**: Collect only necessary data
- **Consent Management**: Clear consent for data processing
- **Data Portability**: Export user data capability

### Security Standards
- **OWASP Top 10**: Address common web vulnerabilities
- **ISO 27001**: Information security management
- **SOC 2**: Security and availability controls
- **PCI DSS**: If handling payment data

## 📚 Security Resources

### Internal Documentation
- [Authentication Security](./authentication.md) - Detailed auth security measures
- [Encryption Guide](./encryption.md) - Encryption implementation details

### External Resources
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)

---

*This security overview provides comprehensive guidelines for maintaining a secure imaginaryStorage application. Regular security reviews and updates are essential for maintaining protection against evolving threats.*