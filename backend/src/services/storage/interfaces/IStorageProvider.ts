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
  expiresIn?: number; // in seconds
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
  
  /**
   * Initialize the storage provider with configuration
   */
  initialize(config: StorageConfig): Promise<void>;
  
  /**
   * Upload a file to the storage provider
   */
  uploadFile(params: UploadParams): Promise<UploadResult>;
  
  /**
   * Generate a signed/temporary URL for file download
   */
  getDownloadUrl(params: DownloadUrlParams): Promise<string>;
  
  /**
   * Delete a file from storage
   */
  deleteFile(params: DeleteParams): Promise<void>;
  
  /**
   * Check if the provider is properly configured and ready
   */
  isConfigured(): boolean;
  
  /**
   * Get provider-specific metadata
   */
  getProviderInfo(): {
    name: string;
    type: string;
    features: string[];
    limitations?: Record<string, any>;
  };
  
  /**
   * Health check for the provider
   */
  healthCheck(): Promise<boolean>;
}