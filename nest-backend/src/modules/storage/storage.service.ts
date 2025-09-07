import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWSStorageProvider } from './providers/aws-storage.provider';
import { IStorageProvider, UploadParams, UploadResult, DownloadUrlParams, DeleteParams } from './interfaces/storage-provider.interface';

export type SupportedProviders = 'aws' | 'gcp' | 'azure' | 'local';

@Injectable()
export class StorageService implements OnModuleInit {
  private providers: Map<SupportedProviders, IStorageProvider> = new Map();
  private activeProvider?: IStorageProvider;

  constructor(
    private configService: ConfigService,
    private awsProvider: AWSStorageProvider,
  ) {
    this.registerProvider('aws', this.awsProvider);
  }

  async onModuleInit() {
    await this.initializeFromEnv();
  }

  registerProvider(type: SupportedProviders, provider: IStorageProvider): void {
    this.providers.set(type, provider);
  }

  async initializeProvider(type: SupportedProviders, config: any): Promise<void> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Storage provider '${type}' not found`);
    }

    await provider.initialize(config);
    this.activeProvider = provider;
  }

  async switchProvider(type: SupportedProviders, config?: any): Promise<void> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Storage provider '${type}' not found`);
    }

    if (config) {
      await provider.initialize(config);
    }

    if (!provider.isConfigured()) {
      throw new Error(`Provider '${type}' is not properly configured`);
    }

    this.activeProvider = provider;
  }

  getActiveProvider(): IStorageProvider {
    if (!this.activeProvider) {
      throw new Error('No storage provider is active. Please initialize a provider first.');
    }
    return this.activeProvider;
  }

  getAvailableProviders(): Array<{ type: SupportedProviders; info: any }> {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      info: provider.getProviderInfo()
    }));
  }

  async uploadFile(params: UploadParams): Promise<UploadResult & { provider: string }> {
    const provider = this.getActiveProvider();
    const result = await provider.uploadFile(params);
    
    return {
      ...result,
      provider: provider.name
    };
  }

  async getDownloadUrl(params: DownloadUrlParams): Promise<string> {
    const provider = this.getActiveProvider();
    return provider.getDownloadUrl(params);
  }

  async deleteFile(params: DeleteParams): Promise<void> {
    const provider = this.getActiveProvider();
    return provider.deleteFile(params);
  }

  async healthCheck(): Promise<{ provider: string; healthy: boolean }> {
    const provider = this.getActiveProvider();
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

  getProviderStats(): {
    active: string;
    available: number;
    configured: number;
    providers: Array<{ type: SupportedProviders; name: string; configured: boolean }>;
  } {
    const providers = Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      name: provider.name,
      configured: provider.isConfigured()
    }));

    return {
      active: this.activeProvider?.name || 'None',
      available: this.providers.size,
      configured: providers.filter(p => p.configured).length,
      providers
    };
  }

  private async initializeFromEnv(): Promise<void> {
    try {
      // AWS Configuration
      if (this.configService.get('AWS_ACCESS_KEY_ID') && 
          this.configService.get('AWS_SECRET_ACCESS_KEY') && 
          this.configService.get('AWS_S3_BUCKET')) {
        
        const awsConfig = {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
          region: this.configService.get('AWS_REGION') || 'us-east-1',
          bucketName: this.configService.get('AWS_S3_BUCKET'),
        };

        await this.initializeProvider('aws', awsConfig);
        console.log('✅ AWS Storage provider initialized successfully');
      } else {
        console.warn('⚠️  AWS credentials not found, storage provider not initialized');
      }
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }
}