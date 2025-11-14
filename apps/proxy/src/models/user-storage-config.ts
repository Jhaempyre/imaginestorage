// src/models/UserStorageConfig.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export type StorageProvider = "aws" | "gcp" | "azure" | "local";

export interface StorageCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucketName?: string;

  projectId?: string;
  keyFile?: string;

  accountName?: string;
  accountKey?: string;
  containerName?: string;

  storagePath?: string;
}

export interface IUserStorageConfig extends Document {
  userId: Types.ObjectId;
  provider: StorageProvider;
  credentials: StorageCredentials;

  lastValidatedAt?: Date;
  validationError?: string;
  isValidated: boolean;
  isActive: boolean;

  getMaskedCredentials(): any;
  validateRequiredFields(): any;
}

const UserStorageConfigSchema = new Schema<IUserStorageConfig>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ["aws", "gcp", "azure", "local"],
      required: true,
    },

    credentials: { type: Object, required: true, select: true },
    isValidated: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
    lastValidatedAt: Date,
    validationError: String,
  },
  { timestamps: true }
);

// STATIC
UserStorageConfigSchema.statics.findByUserId = function (
  userId: Types.ObjectId
) {
  return this.findOne({ userId, isActive: true }).select("+credentials");
};

export const UserStorageConfigModel = mongoose.model<IUserStorageConfig>(
  "UserStorageConfig",
  UserStorageConfigSchema
);
