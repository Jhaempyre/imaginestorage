import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileDocument = File & Document & {
  generateShareToken(expiryHours?: number): string;
  isShareTokenValid(): boolean;
};

@Schema({ timestamps: true })
export class File {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 255 })
  originalName: string;

  @Prop({ required: true, unique: true, trim: true, maxlength: 255 })
  fileName: string;

  @Prop({ required: true, unique: true, trim: true, maxlength: 511 })
  fullPath: string;

  @Prop({ required: true, min: 0 })
  fileSize: number;

  @Prop({ required: true, trim: true, lowercase: true })
  mimeType: string;

  @Prop({ required: true, trim: true, lowercase: true, maxlength: 10 })
  fileExtension: string;

  @Prop({ default: null })
  thumbnailPath: string;

  @Prop({ default: false, index: true })
  isPublic: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ 
    required: true,
    enum: ['aws', 'gcp', 'azure', 'local'],
    default: 'aws'
  })
  storageProvider: string;

  @Prop({ required: true, trim: true })
  fileUrl: string;

  // @Prop({ unique: true, sparse: true, index: true })
  // shareToken: string;

  // @Prop({ default: null })
  // shareExpiry: Date;

  // @Prop({ default: false })
  // isEncrypted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);

// Compound indexes for better query performance
FileSchema.index({ userId: 1, deletedAt: 1 });
FileSchema.index({ userId: 1, mimeType: 1 });
FileSchema.index({ createdAt: -1 });

// Text index for search functionality
FileSchema.index({
  originalName: 'text',
  'metadata.description': 'text',
  'metadata.tags': 'text'
});

// Instance method to generate share token
FileSchema.methods.generateShareToken = function (expiryHours: number = 24): string {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  this.shareExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
  return this.shareToken;
};

// Instance method to check if share token is valid
FileSchema.methods.isShareTokenValid = function (): boolean {
  if (!this.shareToken) return false;
  if (this.shareExpiry && new Date() > this.shareExpiry) return false;
  return true;
};

// Static method to find files by user
FileSchema.statics.findByUser = function (userId: Types.ObjectId, options: any = {}) {
  const query = { userId, deletedAt: null };
  return this.find(query, null, options);
};

// Static method to find public files
FileSchema.statics.findPublicFiles = function (options: any = {}) {
  const query = { isPublic: true, deletedAt: null };
  return this.find(query, null, options);
};