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
import { UserStorageConfig, UserStorageConfigDocument } from '@/schemas/user-storage-config.schema';
import { IStorageProvider } from './interfaces/storage-provider.interface';

export type SupportedProviders = 'aws' | 'gcp' | 'azure' | 'local';

@Injectable()
export class StorageService {
  private providers: Map<SupportedProviders, IStorageProvider> = new Map();
  // private activeProvider?: IStorageProviderService;

  constructor(
    private configService: ConfigService,
    private awsProvider: AWSStorageProvider,
    @InjectModel(UserStorageConfig.name) private userStorageConfigModel: Model<UserStorageConfigDocument>,
  ) {
    this.registerProvider('aws', this.awsProvider);
  }

  async onModuleInit() {
    // await this.initializeFromEnv();
  }

  registerProvider(type: SupportedProviders, provider: IStorageProvider): void {
    this.providers.set(type, provider);
  }

  /**
   * 
   * @param userId 
   * @returns provider info with credentials for internal use only
   */
  private async _getActiveProviderForUser(userId: string): Promise<IStorageProvider> {
    const userConfig = await this.userStorageConfigModel.findOne({ userId, isActive: true }).select('provider credentials');

    if (!userConfig) {
      throw new Error('No active storage config found for user');
    }

    const provider = this.providers.get(userConfig.provider);
    await provider.initialize(userConfig.credentials);

    // Check if provider is configured
    if (!provider.isConfigured()) {
      throw new Error('Storage provider is not configured');
    }
    return provider;
  }

  async getUserStorageConfig(userId: string) {
    return this.userStorageConfigModel.findOne({ userId, isActive: true }).select('provider isValidated lastValidatedAt validationError isActive createdAt');
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
}