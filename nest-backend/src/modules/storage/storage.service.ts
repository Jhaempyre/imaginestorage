import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeleteParams,
  DownloadUrlParams,
  UploadParams,
  UploadResult
} from 'src/common/interfaces/storage.interface';
import { AWSStorageProvider } from './providers/aws-storage.provider';
import { GCPStorageProvider } from './providers/gcp-storage.provider';
import { UserStorageConfig, UserStorageConfigDocument } from '@/schemas/user-storage-config.schema';
import { IStorageProvider } from './interfaces/storage-provider.interface';

export type SupportedProviders = 'aws' | 'gcp' | 'azure' | 'local';

@Injectable()
export class StorageService {
  private providers: Map<SupportedProviders, IStorageProvider> = new Map();

  constructor(
    private configService: ConfigService,
    private awsProvider: AWSStorageProvider,
    private gcpProvider: GCPStorageProvider,
    @InjectModel(UserStorageConfig.name) private userStorageConfigModel: Model<UserStorageConfigDocument>,
  ) {
    this.registerProvider('aws', this.awsProvider);
    this.registerProvider('gcp', this.gcpProvider);
  }

  async onModuleInit() {
    // await this.initializeFromEnv();
  }

  registerProvider(type: SupportedProviders, provider: IStorageProvider): void {
    this.providers.set(type, provider);
  }

  /**
   * Get active provider for user with credentials
   * For testing, we'll use hardcoded GCP credentials
   * @param userId 
   * @returns provider info with credentials for internal use only
   */
  private async _getActiveProviderForUser(userId: string): Promise<IStorageProvider> {
    // TODO: Uncomment this when you want to use database credentials
    /*
    const userConfig = await this.userStorageConfigModel.findOne({ userId, isActive: true }).select('provider credentials');
    
    if (!userConfig) {
      throw new Error('No active storage config found for user');
    }
    
    const provider = this.providers.get(userConfig.provider);
    await provider.initialize(userConfig.credentials);
    */

    // TEMPORARY: Hardcoded GCP credentials for testing
    // Replace these with your actual GCP service account credentials
    const testGCPConfig = {
      "type": "service_account",
      "project_id": "your-project-id", // Replace with your project ID
      "private_key_id": "your-private-key-id", // Replace with your private key ID
      "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n", // Replace with your private key
      "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com", // Replace with your client email
      "client_id": "your-client-id", // Replace with your client ID
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/your-service-account%40your-project-id.iam.gserviceaccount.com", // Replace with your cert URL
      "universe_domain": "googleapis.com",
      "bucket": "your-bucket-name" // Replace with your bucket name
    };

    const provider = this.providers.get('gcp'); // Using GCP for testing
    if (!provider) {
      throw new Error('GCP provider not found');
    }

    await provider.initialize(testGCPConfig);

    // Check if provider is configured
    if (!provider.isConfigured()) {
      throw new Error('Storage provider is not configured');
    }
    return provider;
  }

  /**
   * Alternative method to get provider with database credentials (for production)
   */
  private async _getActiveProviderForUserFromDB(userId: string): Promise<IStorageProvider> {
    const userConfig = await this.userStorageConfigModel.findOne({ userId, isActive: true }).select('provider credentials');
    
    if (!userConfig) {
      throw new Error('No active storage config found for user');
    }
    
    const provider = this.providers.get(userConfig.provider);
    if (!provider) {
      throw new Error(`Provider ${userConfig.provider} not found`);
    }

    await provider.initialize(userConfig.credentials);
    
    // Check if provider is configured
    if (!provider.isConfigured()) {
      throw new Error('Storage provider is not configured');
    }
    return provider;
  }

  async getUserStorageConfig(userId: string) {
    // For testing, return mock data
    return {
      provider: 'gcp',
      isValidated: true,
      lastValidatedAt: new Date(),
      validationError: null,
      isActive: true,
      createdAt: new Date()
    };

    // TODO: Uncomment for production
    // return this.userStorageConfigModel.findOne({ userId, isActive: true }).select('provider isValidated lastValidatedAt validationError isActive createdAt');
  }

  async uploadFile(userId: string, params: UploadParams): Promise<UploadResult & { provider: string }> {
    const provider = await this._getActiveProviderForUser(userId);
    const result = await provider.uploadFile(params);

    return {
      ...result,
      provider: provider.type,
    };
  }

  async getDownloadUrl(userId: string, params: DownloadUrlParams): Promise<string> {
    const provider = await this._getActiveProviderForUser(userId);
    return provider.getDownloadUrl(params);
  }

  async deleteFile(userId: string, params: DeleteParams): Promise<void> {
    const provider = await this._getActiveProviderForUser(userId);
    return provider.deleteFile(params);
  }

  async healthCheck(userId: string): Promise<{ provider: string; healthy: boolean }> {
    const provider = await this._getActiveProviderForUser(userId);
    const healthy = await provider.healthCheck();

    return {
      provider: provider.name,
      healthy
    };
  }

  async healthCheckAll(): Promise<Array<{ type: SupportedProviders; provider: string; healthy: boolean }>> {
    const results = [];

    for (const [type, provider] of this.providers.entries()) {
      if (provider.isConfigured()) {
        const healthy = await provider.healthCheck();
        results.push({
          type,
          provider: provider.name,
          healthy
        });
      }
    }

    return results;
  }

  // Helper method to test GCP configuration
  async testGCPConfiguration(userId: string, gcpConfig: any): Promise<boolean> {
    try {
      const gcpProvider = new GCPStorageProvider();
      await gcpProvider.initialize(gcpConfig);
      return await gcpProvider.healthCheck();
    } catch (error) {
      console.error('GCP configuration test failed:', error);
      return false;
    }
  }
}