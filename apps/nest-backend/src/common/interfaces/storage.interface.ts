import {
  StorageProvider,
  StorageValidationError,
} from "../constants/storage.constants";

/**
 * Storage Provider Credentials Interface
 */
export interface StorageCredentials {
  // AWS
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  bucketName?: string;

  // GCP
  projectId?: string;
  keyFile?: string; // Base64 encoded key file

  // Azure
  accountName?: string;
  accountKey?: string;
  containerName?: string;

  // Local
  storagePath?: string;

  // Additional provider-specific fields
  [key: string]: any;
}

/**
 * Storage Configuration Interface
 */
export interface StorageConfig {
  provider: StorageProvider;
  credentials: StorageCredentials;
  isValidated: boolean;
  lastValidatedAt?: Date;
  validationError?: string;
}

/**
 * Storage Validation Result
 */
export interface StorageValidationResult {
  isValid: boolean;
  error?: {
    code: StorageValidationError;
    message: string;
    details?: string;
    suggestions?: string[];
  };
  storageInfo?: {
    bucketName?: string;
    region?: string;
    permissions?: string[];
    availableSpace?: string;
    [key: string]: any;
  };
}

/**
 * Storage Provider Field Definition
 */
export interface StorageFieldDefinition {
  name: string;
  label: string;
  type: "text" | "password" | "select" | "textarea" | string;
  required: boolean;
  description: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

/**
 * Storage Provider Metadata
 */
export interface StorageProviderMetadata {
  id: StorageProvider;
  name: string;
  description: string;
  features: string[];
  requiredFields: string[];
  fieldDefinitions: Record<string, StorageFieldDefinition>;
}

/**
 * Upload Parameters for Storage Providers
 */
export interface UploadParams {
  tmpLocation: string;
  fullPath: string;
  mimeType: string;
  metadata?: Record<string, string>;
}

/**
 * Upload Result from Storage Providers
 */
export interface UploadResult {
  fileUrl: string;
  fullPath: string;
  publicUrl?: string;
  metadata?: Record<string, any>;
}
/**
 * Get Files Parameters
 */
export interface GetFilesParams {
  prefix?: string;
  maxKeys?: number;
}

/**
 * Download URL Parameters
 */
export interface DownloadUrlParams {
  fileName: string;
  expiresIn?: number;
  userId: string;
}

/**
 * Delete Parameters
 */
export interface DeleteParams {
  fileName: string;
}

export interface CreateFolderParams {
  fullPath: string;
}

export interface CreateFolderResults {
  fullPath: string;
}

// new small types for copy/move/batch
export type CopyObjectParams = {
  from: string; // source key (provider key, e.g. "images/a.jpg")
  to: string; // destination key
  metadata?: Record<string, string>;
  replaceMetadata?: boolean;
};

export type MoveObjectParams = CopyObjectParams; // same shape: copy then delete

export type BatchCopyMapping = {
  from: string;
  to: string;
  metadata?: Record<string, string>;
  replaceMetadata?: boolean;
};

export type ListObjectsResult = {
  keys: string[];
};

/**
 * Storage Provider Interface
 * All storage providers must implement this interface
 */
export interface IStorageProvider {
  readonly name: string;
  readonly type: StorageProvider;

  initialize(credentials: StorageCredentials): Promise<void>;
  getFiles(params: GetFilesParams): Promise<any>;
  uploadFile(params: UploadParams): Promise<UploadResult>;
  createFolder(params: CreateFolderParams): Promise<CreateFolderResults>;
  /**
   * List objects under a prefix — must handle pagination and return keys only.
   * Keys returned should be provider-level keys (no _rt/ prefix unless you use it).
   */
  listObjects?(params: {
    prefix?: string;
    maxKeys?: number;
  }): Promise<ListObjectsResult>;

  /**
   * Copy a single object inside the provider.
   * Should use provider-specific copy semantics (eg S3 CopyObjectCommand).
   */
  copyObject?(params: CopyObjectParams): Promise<void>;

  /**
   * Move: copy then delete (best-effort). Providers may implement optimized server-side moves if available.
   */
  moveObject?(params: MoveObjectParams): Promise<void>;

  /**
   * Batch copy many objects with concurrency control.
   */
  batchCopy?(mappings: BatchCopyMapping[], concurrency?: number): Promise<void>;

  getDownloadUrl(params: DownloadUrlParams): Promise<string>;
  deleteFile(params: DeleteParams): Promise<void>;
  validateCredentials(params: StorageCredentials): Promise<StorageValidationResult>;
  healthCheck(): Promise<boolean>;
  isConfigured(): boolean;
  getProviderInfo(): StorageProviderMetadata;
}
