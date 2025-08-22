import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalName: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  fileExtension: string;
  thumbnailPath?: string;
  isPublic: boolean;
  shareToken?: string;
  shareExpiry?: Date;
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // for videos/audio
    bitrate?: number;
    codec?: string;
    [key: string]: any;
  };
  storageProvider: 'aws' | 'gcp';
  storageLocation: string;
  isEncrypted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true,
    maxlength: [255, 'Original file name cannot exceed 255 characters']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    unique: true,
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true,
    lowercase: true
  },
  fileExtension: {
    type: String,
    required: [true, 'File extension is required'],
    trim: true,
    lowercase: true,
    maxlength: [10, 'File extension cannot exceed 10 characters']
  },
  thumbnailPath: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  shareExpiry: {
    type: Date,
    default: null
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  storageProvider: {
    type: String,
    enum: {
      values: ['aws', 'gcp'],
      message: 'Storage provider must be local, aws, gcp, or azure'
    },
  },
  storageLocation: {
    type: String,
    required: [true, 'Storage location is required'],
    trim: true
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
// fileSchema.index({ userId: 1, isDeleted: 1 });
// fileSchema.index({ userId: 1, mimeType: 1 });
// fileSchema.index({ createdAt: -1 });

// Text index for search functionality
// fileSchema.index({
//   originalName: 'text',
//   description: 'text',
//   tags: 'text'
// });

// Pre-save middleware to generate share token if needed
// fileSchema.pre('save', function (next) {
//   if (this.isModified('isPublic') && this.isPublic && !this.shareToken) {
//     const crypto = require('crypto');
//     this.shareToken = crypto.randomBytes(32).toString('hex');
//   }
//   next();
// });


// Instance method to generate share token
fileSchema.methods.generateShareToken = function (expiryHours: number = 24): string {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  this.shareExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
  return this.shareToken;
};

// Instance method to check if share token is valid
fileSchema.methods.isShareTokenValid = function (): boolean {
  if (!this.shareToken) return false;
  if (this.shareExpiry && new Date() > this.shareExpiry) return false;
  return true;
};

// Instance method to get file URL
// fileSchema.methods.getFileUrl = function (): string {
//   // This would be implemented based on your storage provider
//   return `/files/${this.fileName}`;
// };

// Instance method to get thumbnail URL
// fileSchema.methods.getThumbnailUrl = function (): string | null {
//   if (!this.thumbnailPath) return null;
//   return `/thumbnails/${this.thumbnailPath}`;
// };

// Static method to find files by user
fileSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId, options: any = {}) {
  const query = { userId, deletedAt: null };
  return this.find(query, null, options);
};

// Static method to find public files
fileSchema.statics.findPublicFiles = function (options: any = {}) {
  const query = { isPublic: true, deletedAt: null };
  return this.find(query, null, options);
};

export const File = mongoose.model<IFile>('File', fileSchema);