import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  BatchCopyMapping,
  CopyObjectParams,
  CreateFolderParams,
  DeleteParams,
  DownloadUrlParams,
  ListObjectsResult,
  MoveObjectParams,
  UploadResult,
} from "src/common/interfaces/storage.interface";
import { AWSStorageProvider } from "./providers/aws-storage.provider";
import {
  UserStorageConfig,
  UserStorageConfigDocument,
} from "@/schemas/user-storage-config.schema";
import {
  IStorageProvider,
  UploadParams,
} from "@/common/interfaces/storage.interface";
import { STORAGE_PROVIDERS } from "@/common/constants/storage.constants";

export type SupportedProviders =
  (typeof STORAGE_PROVIDERS)[keyof typeof STORAGE_PROVIDERS];

@Injectable()
export class StorageService {
  private providers: Map<SupportedProviders, IStorageProvider> = new Map();
  // private activeProvider?: IStorageProviderService;

  constructor(
    private configService: ConfigService,
    private awsProvider: AWSStorageProvider,
    @InjectModel(UserStorageConfig.name)
    private userStorageConfigModel: Model<UserStorageConfigDocument>,
  ) {
    this.registerProvider("aws", this.awsProvider);
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
  private async _getActiveProviderForUser(
    userId: string | Types.ObjectId,
  ): Promise<IStorageProvider> {
    if (typeof userId === "string") {
      userId = new Types.ObjectId(userId);
    }
    const userConfig = await this.userStorageConfigModel
      .findOne({ userId, isActive: true })
      .select("provider credentials");

    console.log("User Storage Config:", userConfig);
    if (!userConfig) {
      throw new Error("No active storage config found for user");
    }

    const provider = this.providers.get(userConfig.provider);
    await provider.initialize(userConfig.credentials);

    // Check if provider is configured
    if (!provider.isConfigured()) {
      throw new Error("Storage provider is not configured");
    }
    return provider;
  }

  async getUserStorageConfig(userId: string) {
    return this.userStorageConfigModel
      .findOne({ userId, isActive: true })
      .select(
        "provider isValidated lastValidatedAt validationError isActive createdAt",
      );
  }

  async getFiles(
    userId: string,
    params: {
      prefix?: string;
      maxKeys?: number;
    },
  ) {
    const provider = await this._getActiveProviderForUser(userId);
    return provider.getFiles(params);
  }

  async uploadFile(
    userId: string,
    params: UploadParams,
  ): Promise<UploadResult & { provider: string }> {
    const provider = await this._getActiveProviderForUser(userId);
    const result = await provider.uploadFile(params);

    return {
      ...result,
      provider: provider.type,
    };
  }

  async createFolder(createFolderDto: CreateFolderParams & { userId: string }) {
    const provider = await this._getActiveProviderForUser(
      createFolderDto.userId,
    );
    const result = await provider.createFolder(createFolderDto);
    return { ...result, provider: provider.type };
  }

  /**
   * List provider keys under a prefix for a given user.
   * Returns { keys: string[] } where keys are provider-level object keys.
   */
  async listObjects(
    userId: string,
    params: { prefix?: string; maxKeys?: number } = {},
  ): Promise<ListObjectsResult> {
    const provider = await this._getActiveProviderForUser(userId);
    if (!provider.listObjects) {
      throw new Error("Provider does not support listObjects");
    }
    return provider.listObjects(params);
  }

  /**
   * Copy a single object inside the user's active provider.
   */
  async copyObject(userId: string, params: CopyObjectParams): Promise<void> {
    const provider = await this._getActiveProviderForUser(userId);
    if (!provider.copyObject) {
      throw new Error("Provider does not support copyObject");
    }
    return provider.copyObject(params);
  }

  /**
   * Move a single object (copy then delete) inside the provider.
   */
  async moveObject(userId: string, params: MoveObjectParams): Promise<void> {
    const provider = await this._getActiveProviderForUser(userId);
    if (!provider.moveObject) {
      // fallback: implement move using copy + delete via provider methods
      if (provider.copyObject && provider.deleteFile) {
        await provider.copyObject({
          from: params.from,
          to: params.to,
          metadata: params.metadata,
          replaceMetadata: params.replaceMetadata,
        });
        await provider.deleteFile({ fileName: params.from });
        return;
      }
      throw new Error("Provider does not support moveObject");
    }
    return provider.moveObject(params);
  }

  /**
   * Batch copy many object mappings with optional concurrency tuning.
   */
  async batchCopy(
    userId: string,
    mappings: BatchCopyMapping[],
    concurrency = 8,
  ): Promise<void> {
    const provider = await this._getActiveProviderForUser(userId);
    if (!provider.batchCopy) {
      // fallback: simple sequential copy to preserve behavior if provider doesn't implement batchCopy
      for (const m of mappings) {
        if (!provider.copyObject) {
          throw new Error(
            "Provider does not support batch copy or single copy",
          );
        }
        await provider.copyObject({
          from: m.from,
          to: m.to,
          metadata: m.metadata,
          replaceMetadata: m.replaceMetadata,
        });
      }
      return;
    }

    return provider.batchCopy(mappings, concurrency);
  }

  async getDownloadUrl(
    userId: string,
    params: DownloadUrlParams,
  ): Promise<string> {
    const provider = await this._getActiveProviderForUser(userId);
    return provider.getDownloadUrl(params);
  }

  async deleteFile(userId: string, params: DeleteParams): Promise<void> {
    const provider = await this._getActiveProviderForUser(userId);
    return provider.deleteFile(params);
  }

  async healthCheck(
    userId: string,
  ): Promise<{ provider: string; healthy: boolean }> {
    const provider = await this._getActiveProviderForUser(userId);
    const healthy = await provider.healthCheck();

    return {
      provider: provider.name,
      healthy,
    };
  }

  async healthCheckAll(): Promise<
    Array<{ type: SupportedProviders; provider: string; healthy: boolean }>
  > {
    const results = [];

    for (const [type, provider] of this.providers.entries()) {
      if (provider.isConfigured()) {
        const healthy = await provider.healthCheck();
        results.push({
          type,
          provider: provider.name,
          healthy,
        });
      }
    }

    return results;
  }
}
