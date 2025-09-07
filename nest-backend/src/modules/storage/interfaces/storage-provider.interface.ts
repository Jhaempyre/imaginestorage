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

export interface StorageConfig {
  [key: string]: any;
}

export interface IStorageProvider {
  readonly name: string;
  readonly type: 'aws' | 'gcp' | 'azure' | 'local';
  
  initialize(config: StorageConfig): Promise<void>;
  uploadFile(params: UploadParams): Promise<UploadResult>;
  getDownloadUrl(params: DownloadUrlParams): Promise<string>;
  deleteFile(params: DeleteParams): Promise<void>;
  isConfigured(): boolean;
  getProviderInfo(): {
    name: string;
    type: string;
    features: string[];
    limitations?: Record<string, any>;
  };
  healthCheck(): Promise<boolean>;
}