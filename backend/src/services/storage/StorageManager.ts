import { IStorageProvider, UploadParams, UploadResult, DownloadUrlParams, DeleteParams } from './interfaces/IStorageProvider';
import { AWSStorageProvider, AWSConfig } from './providers/AWSStorageProvider';

export type SupportedProviders = 'aws' | 'gcp' | 'azure' | 'local';

export interface ProviderConfig {
  aws?: AWSConfig;
  gcp?: any; // Will be defined when GCP provider is implemented
  azure?: any; // Will be defined when Azure provider is implemented
  local?: any; // Will be defined when Local provider is implemented
}

export class StorageManager {
  private providers: Map<SupportedProviders, IStorageProvider> = new Map();
  private activeProvider?: IStorageProvider;
  private defaultProvider: SupportedProviders = 'aws';

  constructor(onDemandProvider?: SupportedProviders) {
    // Register available providers
    this.registerProvider(onDemandProvider ?? this.defaultProvider, new AWSStorageProvider());
    // this.registerProvider('gcp', new GCPStorageProvider()); // Future
    // this.registerProvider('azure', new AzureStorageProvider()); // Future
    // this.registerProvider('local', new LocalStorageProvider()); // Future
  }

  /**
   * Register a storage provider
   */
  registerProvider(type: SupportedProviders, provider: IStorageProvider): void {
    this.providers.set(type, provider);
  }

  /**
   * Initialize and set active provider
   */
  async initializeProvider(type: SupportedProviders, config: ProviderConfig): Promise<void> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Storage provider '${type}' not found`);
    }

    const providerConfig = config[type];
    if (!providerConfig) {
      throw new Error(`Configuration for provider '${type}' not provided`);
    }

    await provider.initialize(providerConfig);
    this.activeProvider = provider;
  }

  /**
   * Switch to a different provider
   */
  async switchProvider(type: SupportedProviders, config?: ProviderConfig): Promise<void> {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Storage provider '${type}' not found`);
    }

    if (config && config[type]) {
      await provider.initialize(config[type]);
    }                                                                                    

    if (!provider.isConfigured()) {
      throw new Error(`Provider '${type}' is not properly configured`);
    }

    this.activeProvider = provider;
  }

  /**
   * Get the currently active provider
   */
  getActiveProvider(): IStorageProvider {
    if (!this.activeProvider) {
      throw new Error('No storage provider is active. Please initialize a provider first.');
    }
    return this.activeProvider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): Array<{ type: SupportedProviders; info: any }> {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      info: provider.getProviderInfo()
    }));
  }

  /**
   * Upload file using active provider
   */
  async uploadFile(params: UploadParams): Promise<UploadResult & { provider: string }> {
    const provider = this.getActiveProvider();
    const result = await provider.uploadFile(params);
    
    return {
      ...result,
      provider: provider.name
    };
  }

  /**
   * Get download URL using active provider
   */
  async getDownloadUrl(params: DownloadUrlParams): Promise<string> {
    const provider = this.getActiveProvider();
    return provider.getDownloadUrl(params);
  }

  /**
   * Delete file using active provider
   */
  async deleteFile(params: DeleteParams): Promise<void> {
    const provider = this.getActiveProvider();
    return provider.deleteFile(params);
  }

  /**
   * Health check for active provider
   */
  async healthCheck(): Promise<{ provider: string; healthy: boolean }> {
    const provider = this.getActiveProvider();
    const healthy = await provider.healthCheck();
    
    return {
      provider: provider.name,
      healthy
    };
  }

  /**
   * Health check for all providers
   */
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

  /**
   * Get provider statistics and info
   */
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
}

// Singleton instance
export const storageManager = new StorageManager();