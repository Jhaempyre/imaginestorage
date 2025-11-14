// src/models/File.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFile extends Document {
  ownerId: Types.ObjectId;
  type: "file" | "folder";
  originalName: string;
  fileName: string;
  fullPath: string;
  parentPath: string;

  fileSize: number;
  mimeType: string | null;
  fileExtension: string | null;

  thumbnailPath: string | null;
  fileUrl: string | null;

  isPublic: boolean;
  metadata: Record<string, any>;

  storageProvider: "aws" | "gcp" | "azure" | "local";
  providerMetadata: Record<string, any>;

  deletedAt: Date | null;

  shareToken?: string | null;
  shareExpiry?: Date | null;

  generateShareToken(expiryHours?: number): string;
  isShareTokenValid(): boolean;
}

const FileSchema = new Schema<IFile>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["file", "folder"], default: "file", index: true },

    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    fileName: { type: String, required: true, trim: true, maxlength: 255 },

    fullPath: { type: String, required: true, unique: true, trim: true, maxlength: 511 },
    parentPath: { type: String, required: true, trim: true, maxlength: 511, index: true },

    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: null },
    fileExtension: { type: String, default: null },

    thumbnailPath: { type: String, default: null },
    fileUrl: { type: String, default: null },

    isPublic: { type: Boolean, default: false, index: true },

    metadata: { type: Object, default: {} },

    storageProvider: {
      type: String,
      enum: ["aws", "gcp", "azure", "local"],
      default: "aws",
      index: true,
    },

    providerMetadata: { type: Object, default: {} },

    deletedAt: { type: Date, default: null },

    shareToken: { type: String, default: null },
    shareExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

// ======= INSTANCE METHODS =======

FileSchema.methods.generateShareToken = function (expiryHours: number = 24): string {
  const crypto = require("crypto");
  this.shareToken = crypto.randomBytes(32).toString("hex");
  this.shareExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
  return this.shareToken;
};

FileSchema.methods.isShareTokenValid = function (): boolean {
  if (!this.shareToken) return false;
  if (this.shareExpiry && new Date() > this.shareExpiry) return false;
  return true;
};

// ======= INDEXES =======
FileSchema.index({ ownerId: 1, deletedAt: 1 });
FileSchema.index({ ownerId: 1, type: 1, deletedAt: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({
  originalName: "text",
  "metadata.description": "text",
  "metadata.tags": "text",
});

export const FileModel = mongoose.model<IFile>("File", FileSchema);
