import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApiKeyDocument = ApiKey & Document;

@Schema({ timestamps: true })
export class ApiKey {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, length: 30 })
  key: string;

  @Prop({ required: true })
  maxFileSize: number; // in GB

  @Prop({ required: true, type: [String] })
  allowedMimeTypes: string[];

  @Prop({ required: true, type: [String] })
  allowedExtensions: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastUsedAt: Date;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ default: null })
  revokedAt: Date;

  @Prop({ default: null })
  revokedBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

// Index for efficient queries
ApiKeySchema.index({ userId: 1, createdAt: -1 });
ApiKeySchema.index({ key: 1 });
ApiKeySchema.index({ isActive: 1 });