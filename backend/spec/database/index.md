# Database Overview

Database configuration and management for the imaginaryStorage application.

## 📊 Database Architecture

### Technology Stack
- **Database**: MongoDB
- **ODM**: Mongoose
- **Driver**: MongoDB Node.js Driver (via Mongoose)
- **Connection**: Single connection with connection pooling

### Database Information
- **Name**: `imaginaryStorage`
- **Collections**: `users`, `files`
- **Connection File**: `src/db/database.ts`

## 🔗 Connection Configuration

### Connection String Format
```
mongodb://[username:password@]host[:port]/database[?options]
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017
```

### Connection Options
```typescript
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0
};
```

## 📋 Collections Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  avatar: String,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Files Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  originalName: String,
  fileName: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,
  fileExtension: String,
  fileHash: String,
  thumbnailPath: String,
  description: String,
  tags: [String],
  isPublic: Boolean,
  shareToken: String,
  shareExpiry: Date,
  downloadCount: Number,
  lastDownloaded: Date,
  metadata: Object,
  uploadProgress: Number,
  uploadStatus: String,
  processingStatus: String,
  storageProvider: String,
  storageLocation: String,
  backupLocation: String,
  encryption: Object,
  virus: Object,
  access: Object,
  expiryDate: Date,
  isDeleted: Boolean,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 📇 Indexing Strategy

### Users Collection Indexes
```javascript
// Unique indexes
{ "username": 1 }
{ "email": 1 }

// Query optimization indexes
{ "isActive": 1 }
{ "isEmailVerified": 1 }
{ "createdAt": -1 }
```

### Files Collection Indexes
```javascript
// Unique indexes
{ "fileName": 1 }
{ "fileHash": 1 }
{ "shareToken": 1 }

// Single field indexes
{ "userId": 1 }
{ "isPublic": 1 }
{ "uploadStatus": 1 }
{ "processingStatus": 1 }
{ "isDeleted": 1 }
{ "expiryDate": 1 }
{ "createdAt": -1 }
{ "fileSize": 1 }
{ "tags": 1 }

// Compound indexes
{ "userId": 1, "isDeleted": 1 }
{ "userId": 1, "uploadStatus": 1 }
{ "userId": 1, "mimeType": 1 }
{ "shareToken": 1, "shareExpiry": 1 }

// Text search index
{ "originalName": "text", "description": "text", "tags": "text" }
```

## 🔧 Connection Management

### Connection File Structure
```typescript
// src/db/database.ts
import mongoose from 'mongoose';
import { DB_NAME } from "../../constants";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`MongoDB connected!! DB host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### Connection Events
```typescript
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});
```

## 📈 Performance Optimization

### Connection Pooling
```typescript
const options = {
  maxPoolSize: 10,        // Maximum number of connections
  minPoolSize: 5,         // Minimum number of connections
  maxIdleTimeMS: 30000,   // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take
};
```

### Query Optimization
- **Use indexes** for frequently queried fields
- **Limit result sets** with pagination
- **Project only needed fields** to reduce bandwidth
- **Use aggregation pipelines** for complex queries

### Memory Management
- **Lean queries** for read-only operations
- **Streaming** for large datasets
- **Connection pooling** to reuse connections
- **Proper error handling** to prevent memory leaks

## 🛡️ Security Configuration

### Authentication
```typescript
// For production with authentication
const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
```

### SSL/TLS
```typescript
const options = {
  ssl: true,
  sslValidate: true,
  sslCA: fs.readFileSync('path/to/ca.pem'),
  sslCert: fs.readFileSync('path/to/client-cert.pem'),
  sslKey: fs.readFileSync('path/to/client-key.pem'),
};
```

### Network Security
- **Firewall rules** to restrict database access
- **VPN/Private networks** for production
- **IP whitelisting** for additional security
- **Regular security updates** for MongoDB

## 🔄 Backup and Recovery

### Backup Strategy
```bash
# Full database backup
mongodump --uri="mongodb://localhost:27017/imaginaryStorage" --out=/backup/$(date +%Y%m%d)

# Collection-specific backup
mongodump --uri="mongodb://localhost:27017/imaginaryStorage" --collection=users --out=/backup/users

# Compressed backup
mongodump --uri="mongodb://localhost:27017/imaginaryStorage" --gzip --out=/backup/compressed
```

### Restore Operations
```bash
# Full database restore
mongorestore --uri="mongodb://localhost:27017/imaginaryStorage" /backup/20231201

# Collection-specific restore
mongorestore --uri="mongodb://localhost:27017/imaginaryStorage" --collection=users /backup/users/imaginaryStorage/users.bson
```

### Automated Backups
```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mongodump --uri="$MONGODB_URI/imaginaryStorage" --out="$BACKUP_DIR"

# Keep only last 7 days of backups
find /backup -type d -mtime +7 -exec rm -rf {} \;
```

## 📊 Monitoring and Maintenance

### Database Statistics
```javascript
// Get database stats
db.stats()

// Get collection stats
db.users.stats()
db.files.stats()

// Index usage statistics
db.users.aggregate([{$indexStats: {}}])
db.files.aggregate([{$indexStats: {}}])
```

### Performance Monitoring
```javascript
// Slow query profiling
db.setProfilingLevel(2, { slowms: 100 })

// Current operations
db.currentOp()

// Server status
db.serverStatus()
```

### Maintenance Tasks
```javascript
// Rebuild indexes
db.users.reIndex()
db.files.reIndex()

// Compact collections
db.runCommand({ compact: "users" })
db.runCommand({ compact: "files" })

// Validate collections
db.users.validate()
db.files.validate()
```

## 🚀 Deployment Considerations

### Production Environment
- **Replica sets** for high availability
- **Sharding** for horizontal scaling
- **Read preferences** for load distribution
- **Write concerns** for data consistency

### Environment Variables
```env
# Development
MONGODB_URI=mongodb://localhost:27017

# Production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# Replica Set
MONGODB_URI=mongodb://host1:27017,host2:27017,host3:27017/imaginaryStorage?replicaSet=rs0
```

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    container_name: imaginary-storage-db
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: imaginaryStorage
    volumes:
      - mongodb_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro

volumes:
  mongodb_data:
```

## 📚 Related Documentation

- [Connection Configuration](./connection.md)
- [Migration Guidelines](./migrations.md)
- [Models Overview](../models/index.md)
- [Security Guide](../security/index.md)
- [API Documentation](../api/index.md)

---

*This overview provides comprehensive database configuration and management guidelines for the imaginaryStorage application.*