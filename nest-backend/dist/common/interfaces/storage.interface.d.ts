import { StorageProvider, StorageValidationError } from '../constants/storage.constants';
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
    [key: string]: any;
}
export interface StorageConfig {
    provider: StorageProvider;
    credentials: StorageCredentials;
    isValidated: boolean;
    lastValidatedAt?: Date;
    validationError?: string;
}
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
export interface StorageFieldDefinition {
    name: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'textarea';
    required: boolean;
    description: string;
    placeholder?: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}
export interface StorageProviderMetadata {
    id: StorageProvider;
    name: string;
    description: string;
    features: string[];
    requiredFields: string[];
    fieldDefinitions: Record<string, StorageFieldDefinition>;
}
export interface UploadParams {
    filePath: string;
    fileName: string;
    userId: string;
    mimeType: string;
    fileSize: number;
}
export interface UploadResult {
    storageLocation: string;
    fileName: string;
    publicUrl?: string;
    metadata?: Record<string, any>;
}
export interface DownloadUrlParams {
    fileName: string;
    expiresIn?: number;
    userId: string;
}
export interface DeleteParams {
    fileName: string;
    userId: string;
}
export interface IStorageProvider {
    readonly name: string;
    readonly type: StorageProvider;
    initialize(credentials: StorageCredentials): Promise<void>;
    uploadFile(params: UploadParams): Promise<UploadResult>;
    getDownloadUrl(params: DownloadUrlParams): Promise<string>;
    deleteFile(params: DeleteParams): Promise<void>;
    isConfigured(): boolean;
    validateCredentials(): Promise<StorageValidationResult>;
    getProviderInfo(): StorageProviderMetadata;
    healthCheck(): Promise<boolean>;
}
