import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StorageProvider } from '../common/constants/storage.constants';
import { StorageCredentials } from '../common/interfaces/storage.interface';

export type UserStorageConfigDocument = UserStorageConfig & Document;

@Schema({ timestamps: true })
export class UserStorageConfig {
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true 
  })
  userId: Types.ObjectId;

  @Prop({ 
    required: true,
    enum: ['aws', 'gcp', 'azure', 'local'],
    index: true
  })
  provider: StorageProvider;

  @Prop({ 
    required: true, 
    type: Object,
    select: false // Don't include credentials in default queries for security
  })
  credentials: StorageCredentials;

  @Prop({ default: false, index: true })
  isValidated: boolean;

  @Prop({ default: null })
  lastValidatedAt: Date;

  @Prop({ default: null })
  validationError: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const UserStorageConfigSchema = SchemaFactory.createForClass(UserStorageConfig);

// Indexes for better query performance
UserStorageConfigSchema.index({ userId: 1, isActive: 1 });
UserStorageConfigSchema.index({ provider: 1, isValidated: 1 });

// Instance method to mask sensitive credentials
UserStorageConfigSchema.methods.getMaskedCredentials = function(): Partial<StorageCredentials> {
  const masked: Partial<StorageCredentials> = {};
  
  switch (this.provider) {
    case 'aws':
      masked.accessKeyId = this.credentials.accessKeyId?.replace(/(.{4}).*(.{4})/, '$1***$2');
      masked.region = this.credentials.region;
      masked.bucketName = this.credentials.bucketName;
      break;
      
    case 'gcp':
      masked.projectId = this.credentials.projectId;
      masked.bucketName = this.credentials.bucketName;
      // Don't expose keyFile at all
      break;
      
    case 'azure':
      masked.accountName = this.credentials.accountName;
      masked.containerName = this.credentials.containerName;
      // Don't expose accountKey
      break;
      
    case 'local':
      masked.storagePath = this.credentials.storagePath;
      break;
  }
  
  return masked;
};

// Instance method to validate required fields
UserStorageConfigSchema.methods.validateRequiredFields = function(): { isValid: boolean; missingFields: string[] } {
  const requiredFields: Record<StorageProvider, string[]> = {
    aws: ['accessKeyId', 'secretAccessKey', 'region', 'bucketName'],
    gcp: ['projectId', 'keyFile', 'bucketName'],
    azure: ['accountName', 'accountKey', 'containerName'],
    local: ['storagePath'],
  };
  
  const required = requiredFields[this.provider] || [];
  const missingFields = required.filter(field => !this.credentials[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

// Static method to find config by user
UserStorageConfigSchema.statics.findByUserId = function(userId: Types.ObjectId) {
  return this.findOne({ userId, isActive: true });
};

// Static method to find validated configs
UserStorageConfigSchema.statics.findValidatedConfigs = function() {
  return this.find({ isValidated: true, isActive: true });
};