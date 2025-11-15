import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { DeleteParams, DownloadUrlParams, UploadParams, UploadResult } from 'src/common/interfaces/storage.interface';
import { AWSStorageProvider } from './providers/aws-storage.provider';
import { GCPStorageProvider } from './providers/gcp-storage.provider';
import { UserStorageConfigDocument } from '@/schemas/user-storage-config.schema';
import { IStorageProvider } from './interfaces/storage-provider.interface';
export type SupportedProviders = 'aws' | 'gcp' | 'azure' | 'local';
export declare class StorageService {
    private configService;
    private awsProvider;
    private gcpProvider;
    private userStorageConfigModel;
    private providers;
    constructor(configService: ConfigService, awsProvider: AWSStorageProvider, gcpProvider: GCPStorageProvider, userStorageConfigModel: Model<UserStorageConfigDocument>);
    onModuleInit(): Promise<void>;
    registerProvider(type: SupportedProviders, provider: IStorageProvider): void;
    private _getActiveProviderForUser;
    private _getActiveProviderForUserFromDB;
    getUserStorageConfig(userId: string): Promise<{
        provider: string;
        isValidated: boolean;
        lastValidatedAt: Date;
        validationError: any;
        isActive: boolean;
        createdAt: Date;
    }>;
    uploadFile(userId: string, params: UploadParams): Promise<UploadResult & {
        provider: string;
    }>;
    getDownloadUrl(userId: string, params: DownloadUrlParams): Promise<string>;
    deleteFile(userId: string, params: DeleteParams): Promise<void>;
    healthCheck(userId: string): Promise<{
        provider: string;
        healthy: boolean;
    }>;
    healthCheckAll(): Promise<Array<{
        type: SupportedProviders;
        provider: string;
        healthy: boolean;
    }>>;
    testGCPConfiguration(userId: string, gcpConfig: any): Promise<boolean>;
}
