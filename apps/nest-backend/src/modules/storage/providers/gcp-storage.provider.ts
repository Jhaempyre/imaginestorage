import {
  BatchCopyMapping,
  CopyObjectParams,
  CreateFolderParams,
  CreateFolderResults,
  DeleteParams,
  DownloadUrlParams,
  GetFilesParams,
  IStorageProvider,
  ListObjectsResult,
  MoveObjectParams,
  StorageConfig,
  StorageProviderMetadata,
  StorageValidationResult,
  UploadParams,
  UploadResult,
} from "@/common/interfaces/storage.interface";
import {
  STORAGE_PROVIDER_METADATA,
  STORAGE_PROVIDERS,
  STORAGE_VALIDATION_ERRORS,
} from "@/common/constants/storage.constants";
import { Storage } from "@google-cloud/storage";
import { Injectable, Logger } from "@nestjs/common";
import { randomBytes } from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface GCPConfig extends StorageConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  universe_domain: string;
  bucket: string;
}

@Injectable()
export class GCPStorageProvider implements IStorageProvider {
  readonly name = "Google Cloud Storage";
  readonly type = "gcp" as const;
  private readonly logger = new Logger(GCPStorageProvider.name);

  private config?: GCPConfig;
  private isInitialized = false;
  private storage?: Storage;
  private bucketName?: string;

  async initialize(config: GCPConfig): Promise<void> {
    this.config = config;
    this.storage = new Storage({
      projectId: config.project_id,
      credentials: {
        type: config.type,
        project_id: config.project_id,
        private_key_id: config.private_key_id,
        private_key: config.private_key,
        client_email: config.client_email,
        client_id: config.client_id,
        universe_domain: config.universe_domain,
      },
    });

    try {
      this.bucketName = config.bucket;
      const bucket = this.storage.bucket(this.bucketName);

      // Check if bucket exists and is accessible
      const [exists] = await bucket.exists();
      if (!exists) {
        throw new Error(`Bucket ${this.bucketName} does not exist`);
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize GCP Bucket: ${error}`);
    }
  }

  async getFiles(params: GetFilesParams): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { prefix, maxKeys } = params;

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const [files] = await bucket.getFiles({
        prefix,
        maxResults: maxKeys,
      });

      return {
        Contents: files.map(file => ({
          Key: file.name,
          Size: file.metadata.size,
          LastModified: file.metadata.updated,
          ETag: file.metadata.etag,
        })),
        Name: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
        KeyCount: files.length,
      };
    } catch (error) {
      throw new Error(`Failed to get files from GCP Storage: ${error}`);
    }
  }

  async uploadFile(params: UploadParams): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { tmpLocation, fullPath, mimeType } = params;

    try {
      // Checking if file exists
      if (!fs.existsSync(tmpLocation)) {
        throw new Error(`File not found: ${tmpLocation}`);
      }

      const bucket = this.storage!.bucket(this.bucketName!);
      const file = bucket.file(fullPath);

      // Upload file to GCP Storage
      await bucket.upload(tmpLocation, {
        destination: fullPath,
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: path.basename(tmpLocation),
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Make the file public (optional - you can remove this if you want private files)
      // await file.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fullPath}`;
      // const storageLocation = `gs://${this.bucketName}/${fullPath}`;

      return {
        fullPath,
        fileUrl: publicUrl,
        publicUrl,
        metadata: {
          bucket: this.bucketName,
          projectId: this.config!.project_id,
          key: fullPath,
        },
      };
    } catch (error) {
      throw new Error(`Failed to upload file to GCP Storage: ${error}`);
    }
  }

  async createFolder(params: CreateFolderParams): Promise<CreateFolderResults> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { fullPath } = params;

    // Ensure fullPath ends with /
    const key = fullPath.endsWith("/") ? fullPath : `${fullPath}/`;

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const file = bucket.file(key);
      
      // Create an empty "folder" object
      await file.save('', {
        metadata: {
          contentType: 'application/x-directory',
        },
      });

      return { fullPath: key };
    } catch (error) {
      throw new Error(`Failed to create folder in GCP Storage: ${error}`);
    }
  }

  async listObjects(params: GetFilesParams): Promise<ListObjectsResult> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { prefix = "", maxKeys = 1000 } = params || {};
    const normalizedPrefix = this.normalizeKey(prefix);

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const [files] = await bucket.getFiles({
        prefix: normalizedPrefix,
        maxResults: maxKeys,
      });

      const keys = files.map(file => file.name);
      return { keys };
    } catch (error) {
      throw new Error(`Failed to list objects from GCP Storage: ${error}`);
    }
  }

  async copyObject(params: CopyObjectParams): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { from, to, metadata, replaceMetadata = false } = params;
    const sourceKey = this.normalizeKey(from);
    const destKey = this.normalizeKey(to);

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const sourceFile = bucket.file(sourceKey);
      const destFile = bucket.file(destKey);

      const copyOptions: any = {};
      
      if (replaceMetadata && metadata) {
        copyOptions.metadata = {
          metadata: metadata,
        };
      }

      await sourceFile.copy(destFile, copyOptions);
    } catch (error) {
      throw new Error(`Failed to copy object ${from} => ${to}: ${error}`);
    }
  }

  async moveObject(params: MoveObjectParams): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { from, to, metadata, replaceMetadata = false } = params;
    
    // 1) Copy
    await this.copyObject({ from, to, metadata, replaceMetadata });

    // 2) Delete source
    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const sourceFile = bucket.file(this.normalizeKey(from));
      await sourceFile.delete();
    } catch (error) {
      throw new Error(`Copied but failed to delete source ${from}: ${error}`);
    }
  }

  async batchCopy(
    mappings: BatchCopyMapping[],
    concurrency = 8,
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }
    
    if (!mappings || mappings.length === 0) return;

    await this.asyncPool(concurrency, mappings, async (m) => {
      await this.copyObject({
        from: m.from,
        to: m.to,
        metadata: m.metadata,
        replaceMetadata: !!m.replaceMetadata,
      });
    });
  }

  async getDownloadUrl(params: DownloadUrlParams): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { fileName, expiresIn = 3600 } = params;

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const file = bucket.file(fileName);

      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + expiresIn * 1000, // Convert to milliseconds
      });

      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error}`);
    }
  }

  async deleteFile(params: DeleteParams): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("GCP Storage provider not configured");
    }

    const { fileName } = params;

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const file = bucket.file(fileName);

      await file.delete();
    } catch (error) {
      throw new Error(`Failed to delete file from GCP Storage: ${error}`);
    }
  }

  isConfigured(): boolean {
    return (
      this.isInitialized &&
      !!this.storage &&
      !!this.config?.bucket &&
      !!this.config?.project_id &&
      !!this.config?.client_email
    );
  }

  // getProviderInfo() {
  //   return {
  //     name: this.name,
  //     type: this.type,
  //     features: [
  //       "Signed URLs",
  //       "Public URLs",
  //       "Server-side encryption",
  //       "Versioning support",
  //       "Cross-region replication",
  //       "Lifecycle policies",
  //       "IAM integration",
  //     ],
  //     limitations: {
  //       maxFileSize: "5TB",
  //       maxObjectsPerBucket: "Unlimited",
  //       maxBuckets: "Project dependent",
  //     },
  //   };
  // }

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const [exists] = await bucket.exists();
      return exists;
    } catch (error) {
      console.error("GCP Storage health check failed:", error);
      return false;
    }
  }

  async validateCredentials(
    params: GCPConfig,
  ): Promise<StorageValidationResult> {
    let storage: Storage;
    // debugger;

    try {
      storage = new Storage({
        projectId: params.project_id,
        credentials: {
          type: params.type,
          project_id: params.project_id,
          private_key_id: params.private_key_id,
          private_key: params.private_key,
          client_email: params.client_email,
          client_id: params.client_id,
          universe_domain: params.universe_domain,
        },
      });
    } catch (error) {
      this.logger.error(
        `GCP Storage credential validation: client initialization failed: ${error}`,
      );
      return {
        isValid: false,
        error: {
          code: STORAGE_VALIDATION_ERRORS.INVALID_CREDENTIALS,
          message: "GCPStorageProvider.validateCredentials.Failed",
          details: "Failed to create GCP Storage client with provided credentials.",
          suggestions: [
            "Verify the project ID is correct.",
            "Ensure the service account credentials are valid.",
            "Check that the service account has the required permissions.",
          ],
        },
      };
    }

    const bucket = storage.bucket(params.bucket);
    const testKey = `.imaginary/_validator/${randomBytes(16).toString("hex")}.txt`;
    const latency = {
      bucketExists: 0,
      writeTest: 0,
      deleteTest: 0,
    };

    try {
      // Step 1: Check bucket existence
      let start = performance.now();
      const [exists] = await bucket.exists();
      latency.bucketExists = performance.now() - start;

      if (!exists) {
        return {
          isValid: false,
          error: {
            code: "BUCKET_NOT_FOUND",
            message: "The specified bucket does not exist.",
            details: "Unable to find the bucket in the project.",
            suggestions: [
              "Confirm the bucket name is correct.",
              "Ensure the bucket exists in the specified project.",
              "Verify the service account has storage.buckets.get permission.",
            ],
          },
        };
      }
    } catch (err: any) {
      this.logger.error(
        `GCP Storage credential validation: bucket check failed: ${err?.message}`,
      );
      
      return {
        isValid: false,
        error: {
          code: "BUCKET_NOT_FOUND",
          message: "Failed to access the specified bucket.",
          details: "Unable to perform bucket existence check.",
          suggestions: [
            "Confirm the bucket name and project ID.",
            "Ensure the bucket exists in the specified project.",
            "Verify the service account has storage.buckets.get permission.",
          ],
        },
      };
    }

    // Step 2: Write Test
    try {
      const start = performance.now();
      const file = bucket.file(testKey);
      await file.save('ok', {
        metadata: {
          contentType: 'text/plain',
        },
      });
      latency.writeTest = performance.now() - start;
    } catch (err: any) {
      this.logger.error(
        `GCP Storage credential validation: write test failed: ${err?.message}`,
      );
      
      return {
        isValid: false,
        error: {
          code: STORAGE_VALIDATION_ERRORS.INSUFFICIENT_PERMISSIONS,
          message: "Bucket exists but write permission is denied.",
          details: err?.message,
          suggestions: [
            "Grant storage.objects.create permission to your service account.",
            "Ensure the bucket policy allows this service account.",
            "Check if the bucket has any retention policies.",
          ],
        },
      };
    }

    // Step 3: Delete Test
    try {
      const start = performance.now();
      const file = bucket.file(testKey);
      await file.delete();
      latency.deleteTest = performance.now() - start;
    } catch (err: any) {
      this.logger.error(
        `GCP Storage credential validation: delete test failed: ${err?.message}`,
      );
      
      return {
        isValid: false,
        error: {
          code: STORAGE_VALIDATION_ERRORS.INSUFFICIENT_PERMISSIONS,
          message: "Write is allowed but delete permission is denied.",
          details: err?.message,
          suggestions: [
            "Grant storage.objects.delete permission.",
            "Check bucket retention policies.",
          ],
        },
      };
    }

    // All checks passed
    return {
      isValid: true,
      storageInfo: {
        bucketName: params.bucket,
        projectId: params.project_id,
        permissions: [
          "storage.buckets.get",
          "storage.objects.create", 
          "storage.objects.delete"
        ],
        latency,
      },
    };
  }

  getProviderInfo() {
    const f = STORAGE_PROVIDER_METADATA[STORAGE_PROVIDERS.GCP];
    return f satisfies StorageProviderMetadata;
  }

  // Helper methods
  private normalizeKey(key: string): string {
    // Remove leading slashes if any
    if (!key) return key;
    return key.startsWith("/") ? key.slice(1) : key;
  }

  private async asyncPool<T, R>(
    poolLimit: number,
    array: T[],
    iteratorFn: (item: T) => Promise<R>,
  ): Promise<R[]> {
    const ret: R[] = [];
    const executing = new Set<Promise<any>>();

    for (const item of array) {
      const p = Promise.resolve().then(() => iteratorFn(item));
      ret.push(await p); // push result in order (if you want out-of-order, adjust)
      const e = p
        .then(() => executing.delete(e))
        .catch(() => executing.delete(e));
      executing.add(e);

      if (executing.size >= poolLimit) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return ret;
  }
}
