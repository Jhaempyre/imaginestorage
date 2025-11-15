import { IStorageProvider, UploadParams, UploadResult, DownloadUrlParams, DeleteParams, StorageConfig } from '../interfaces/storage-provider.interface';
export interface AWSConfig extends StorageConfig {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
    endpoint?: string;
}
export declare class AWSStorageProvider implements IStorageProvider {
    readonly name = "AWS S3";
    readonly type: "aws";
    private s3Client?;
    private config?;
    private isInitialized;
    initialize(config: AWSConfig): Promise<void>;
    uploadFile(params: UploadParams): Promise<UploadResult>;
    getDownloadUrl(params: DownloadUrlParams): Promise<string>;
    deleteFile(params: DeleteParams): Promise<void>;
    isConfigured(): boolean;
    getProviderInfo(): {
        name: string;
        type: "aws";
        features: string[];
        limitations: {
            maxFileSize: string;
            maxObjectsPerBucket: string;
            maxBuckets: number;
        };
    };
    healthCheck(): Promise<boolean>;
}
