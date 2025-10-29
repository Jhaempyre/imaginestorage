import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileDocument = File & Document & {
  generateShareToken(expiryHours?: number): string;
  isShareTokenValid(): boolean;
};

@Schema({ timestamps: true })
export class File {
  // 🔑 Who owns this node (file or folder)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  // 🔑 Whether this is a file or folder
  @Prop({ required: true, enum: ['file', 'folder'], default: 'file', index: true })
  type: 'file' | 'folder';

  // Human-readable name (for files: name without path)
  @Prop({ required: true, trim: true, maxlength: 255 })
  originalName: string;

  // Unique file name within the system (used internally)
  @Prop({ required: true, trim: true, maxlength: 255 })
  fileName: string;

  // Full path (e.g. "root/images/cat.jpg" or "root/images/")
  @Prop({ required: true, unique: true, trim: true, maxlength: 511 })
  fullPath: string;

  // Parent path for fast lookups (e.g. "root/images/")
  @Prop({ required: true, trim: true, maxlength: 511, index: true })
  parentPath: string;

  // === File-specific props ===
  @Prop({ min: 0, default: 0 })
  fileSize: number;

  @Prop({ trim: true, lowercase: true, default: null })
  mimeType: string | null;

  @Prop({ trim: true, lowercase: true, maxlength: 10, default: null })
  fileExtension: string | null;

  @Prop({ default: null })
  thumbnailPath: string;

  @Prop({ required: false, trim: true, default: null })
  fileUrl: string | null;

  // === Common props for file/folder ===
  @Prop({ default: false, index: true })
  isPublic: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({
    required: true,
    enum: ['aws', 'gcp', 'azure', 'local'],
    default: 'aws',
    index: true
  })
  storageProvider: string;

  @Prop({ type: Object, default: {} })
  providerMetadata: Record<string, any>; // e.g., ETag, versionId, etc.

  @Prop({ default: null })
  deletedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);

// === Indexes for performance ===
FileSchema.index({ ownerId: 1, deletedAt: 1 }); // fast folder listings
FileSchema.index({ ownerId: 1, type: 1, deletedAt: 1 });
FileSchema.index({ createdAt: -1 });

// Full-text search
FileSchema.index({
  originalName: 'text',
  'metadata.description': 'text',
  'metadata.tags': 'text',
});

// Instance methods
FileSchema.methods.generateShareToken = function (expiryHours: number = 24): string {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  this.shareExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
  return this.shareToken;
};

FileSchema.methods.isShareTokenValid = function (): boolean {
  if (!this.shareToken) return false;
  if (this.shareExpiry && new Date() > this.shareExpiry) return false;
  return true;
};

// Static helpers
FileSchema.statics.findByUser = function (userId: Types.ObjectId, options: any = {}) {
  const query = { ownerId: userId, deletedAt: null };
  return this.find(query, null, options);
};

FileSchema.statics.findPublicFiles = function (options: any = {}) {
  const query = { isPublic: true, deletedAt: null };
  return this.find(query, null, options);
};
