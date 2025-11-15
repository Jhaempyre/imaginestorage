import { IStorageProvider, UploadParams, UploadResult, DownloadUrlParams, DeleteParams, StorageConfig } from '../interfaces/storage-provider.interface';
export interface GCPConfig extends StorageConfig {
    "type": string;
    "project_id": string;
    "private_key_id": string;
    "private_key": string;
    "client_email": string;
    "client_id": string;
    "universe_domain": string;
    "bucket": string;
}
export declare class GCPStorageProvider implements IStorageProvider {
    readonly name = "GCP Storage";
    readonly type: "gcp";
    private config?;
    private isInitialized;
    private storage?;
    private bucketName?;
    initialize(config: GCPConfig): Promise<void>;
    uploadFile(params: UploadParams): Promise<UploadResult>;
    getDownloadUrl(params: DownloadUrlParams): Promise<string>;
    deleteFile(params: DeleteParams): Promise<void>;
    isConfigured(): boolean;
    getProviderInfo(): {
        name: string;
        type: "gcp";
        features: string[];
        limitations: {
            maxFileSize: string;
            maxObjectsPerBucket: string;
            maxBuckets: string;
        };
    };
    healthCheck(): Promise<boolean>;
}
