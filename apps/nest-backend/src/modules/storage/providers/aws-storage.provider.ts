import { Injectable, Logger } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import * as path from "path";
import {
  IStorageProvider,
  UploadParams,
  UploadResult,
  DownloadUrlParams,
  DeleteParams,
  StorageConfig,
  GetFilesParams,
  StorageProviderMetadata,
  StorageValidationResult,
  CreateFolderParams,
  CreateFolderResults,
} from "@/common/interfaces/storage.interface";
import {
  STORAGE_PROVIDER_METADATA,
  STORAGE_PROVIDERS,
  STORAGE_VALIDATION_ERRORS,
} from "@/common/constants/storage.constants";
import { randomBytes } from "crypto";

export interface AWSConfig extends StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint?: string;
}

@Injectable()
export class AWSStorageProvider implements IStorageProvider {
  readonly name = "AWS S3";
  readonly type = "aws" as const;
  private readonly logger = new Logger(AWSStorageProvider.name);

  private s3Client?: S3Client;
  private config?: AWSConfig;
  private isInitialized = false;

  async initialize(config: AWSConfig): Promise<void> {
    this.config = config;

    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && { endpoint: config.endpoint }),
    });

    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: config.bucketName }),
      );
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize AWS S3: ${error}`);
    }
  }

  async getFiles(params: GetFilesParams): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("AWS S3 provider not configured");
    }

    const { prefix, maxKeys } = params;

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config!.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const result = await this.s3Client!.send(command);
      return result;
    } catch (error) {
      throw new Error(`Failed to get files from AWS S3: ${error}`);
    }
  }

  async uploadFile(params: UploadParams): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error("AWS S3 provider not configured");
    }

    const { tmpLocation, metadata, mimeType, fullPath } = params;
    // const key = `${subfolderPath ?? "/"}${originalName}`;

    try {
      const fileStream = fs.createReadStream(tmpLocation);
      const fileStats = fs.statSync(tmpLocation);

      // console.log({
      //   Bucket: this.config!.bucketName,
      //   Key: key,
      //   ContentType: mimeType,
      //   ContentLength: fileStats.size,
      //   Metadata: {
      //     userId,
      //     originalName: path.basename(tmpLocation),
      //     uploadedAt: new Date().toISOString(),
      //   },
      // });
      const uploadCommand = new PutObjectCommand({
        Bucket: this.config!.bucketName,
        Key: fullPath,
        Body: fileStream,
        ContentType: mimeType,
        ContentLength: fileStats.size,
        Metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client!.send(uploadCommand);

      const fileUrl = `https://s3.${this.config!.region}.amazonaws.com/${this.config!.bucketName}/${fullPath}`;

      return {
        fileUrl,
        fullPath: fullPath,
        metadata: {
          bucket: this.config!.bucketName,
          region: this.config!.region,
          key: fullPath,
        },
      };
    } catch (error) {
      throw new Error(`Failed to upload file to AWS S3: ${error}`);
    }
  }

  async createFolder(params: CreateFolderParams): Promise<CreateFolderResults> {
    if (!this.isConfigured()) {
      throw new Error("AWS S3 provider not configured");
    }

    const { bucketName } = this.config!;
    const { fullPath } = params;

    // Ensure fullPath ends with /
    const key = fullPath.endsWith("/") ? fullPath : `${fullPath}/`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: "", // empty body for "folder"
      });

      await this.s3Client!.send(command);

      return { fullPath: key };
    } catch (error) {
      throw new Error(`Failed to create folder in AWS S3: ${error}`);
    }
  }

  // ---------- New: listObjects (returns list of keys) ----------
  /**
   * List all object keys under the given prefix (handles pagination).
   * @param params { prefix?: string; maxKeys?: number }
   * @returns { keys: string[] }
   */
  async listObjects(params: GetFilesParams): Promise<{ keys: string[] }> {
    if (!this.isConfigured()) throw new Error("AWS S3 provider not configured");

    const { prefix = "", maxKeys = 1000 } = params || {};
    const normalizedPrefix = this.normalizeKey(prefix);

    const keys: string[] = [];
    let continuationToken: string | undefined = undefined;

    try {
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.config!.bucketName,
          Prefix: normalizedPrefix,
          MaxKeys: Math.min(maxKeys, 1000),
          ContinuationToken: continuationToken,
        });

        const result = await this.s3Client!.send(command);

        if (result.Contents && result.Contents.length > 0) {
          for (const obj of result.Contents) {
            if (obj.Key) keys.push(obj.Key);
          }
        }

        continuationToken = result.IsTruncated
          ? result.NextContinuationToken
          : undefined;
        // If user provided a maxKeys smaller than all objects, we obey it.
        if (keys.length >= maxKeys) break;
      } while (continuationToken);
    } catch (error) {
      throw new Error(`Failed to list objects from AWS S3: ${error}`);
    }

    return { keys };
  }

  // ---------- New: copyObject ----------
  /**
   * Copy a single object within the bucket.
   * Note: By default this will COPY metadata. If you want to replace metadata pass metadata and metadataDirective = 'REPLACE'.
   */
  async copyObject(params: {
    from: string; // source key
    to: string; // destination key
    metadata?: Record<string, string>;
    replaceMetadata?: boolean;
  }): Promise<void> {
    if (!this.isConfigured()) throw new Error("AWS S3 provider not configured");

    const { from, to, metadata, replaceMetadata = false } = params;
    const src = encodeURIComponent(
      `${this.config!.bucketName}/${this.normalizeKey(from)}`,
    );
    const destKey = this.normalizeKey(to);

    try {
      const command = new CopyObjectCommand({
        Bucket: this.config!.bucketName,
        Key: destKey,
        CopySource: src,
        // If replaceMetadata true, pass MetadataDirective: 'REPLACE' and metadata
        ...(replaceMetadata
          ? { MetadataDirective: "REPLACE", Metadata: { ...(metadata || {}) } }
          : { MetadataDirective: "COPY" }),
      });

      await this.s3Client!.send(command);
    } catch (error) {
      throw new Error(`Failed to copy object ${from} => ${to}: ${error}`);
    }
  }

  // ---------- New: moveObject (copy + delete) ----------
  /**
   * MoveObject: copy then delete. Best-effort; not transactional.
   */
  async moveObject(params: {
    from: string;
    to: string;
    metadata?: Record<string, string>;
    replaceMetadata?: boolean;
  }): Promise<void> {
    if (!this.isConfigured()) throw new Error("AWS S3 provider not configured");

    const { from, to, metadata, replaceMetadata = false } = params;
    // 1) copy
    await this.copyObject({ from, to, metadata, replaceMetadata });

    // 2) delete source
    try {
      const del = new DeleteObjectCommand({
        Bucket: this.config!.bucketName,
        Key: this.normalizeKey(from),
      });
      await this.s3Client!.send(del);
    } catch (error) {
      // If delete fails we should surface error so callers can decide to retry or cleanup.
      throw new Error(`Copied but failed to delete source ${from}: ${error}`);
    }
  }

  // ---------- New: batchCopy (concurrency controlled) ----------
  /**
   * mappings: Array<{ from: string; to: string }>
   */
  async batchCopy(
    mappings: Array<{
      from: string;
      to: string;
      replaceMetadata?: boolean;
      metadata?: Record<string, string>;
    }>,
    concurrency = 8,
  ): Promise<void> {
    if (!this.isConfigured()) throw new Error("AWS S3 provider not configured");
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
      throw new Error("AWS S3 provider not configured");
    }

    const { fileName, expiresIn = 3600 } = params;

    try {
      const command = new GetObjectCommand({
        Bucket: this.config!.bucketName,
        Key: fileName,
      });

      const signedUrl = await getSignedUrl(this.s3Client!, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error}`);
    }
  }

  async deleteFile(params: DeleteParams): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("AWS S3 provider not configured");
    }

    const { fileName } = params;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config!.bucketName,
        Key: fileName,
      });

      await this.s3Client!.send(command);
    } catch (error) {
      throw new Error(`Failed to delete file from AWS S3: ${error}`);
    }
  }

  async validateCredentials(
    params: AWSConfig,
  ): Promise<StorageValidationResult> {
    let client;
    try {
      client = new S3Client({
        region: params.region,
        credentials: {
          accessKeyId: params.accessKeyId,
          secretAccessKey: params.secretAccessKey,
        },
        ...(params.endpoint && { endpoint: params.endpoint }),
      });
    } catch (error) {
      return {
        isValid: false,
        error: {
          code: STORAGE_VALIDATION_ERRORS.INVALID_CREDENTIALS,
          message: "Failed to create S3 client with provided credentials.",
          details: (error as Error).message,
          suggestions: [
            "Verify Access Key ID and Secret Access Key.",
            "Ensure the user/role is active and not deleted.",
          ],
        },
      };
    }

    const bucket = params.bucketName;
    const testKey = `.imaginary/_validator/${randomBytes(16).toString("hex")}.txt`;

    const latency = {
      headBucket: 0,
      writeTest: 0,
      deleteTest: 0,
    };
    try {
      // ---- Step 1: HEAD Bucket ----
      let start = performance.now();
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
      latency.headBucket = performance.now() - start;
    } catch (err: any) {
      this.logger.error(
        `AWS S3 credential validation: head bucket failed: ${err?.message}`,
      );
      console.error(err);
      const errorCode = err?.name || err?.Code || "Unknown";

      return {
        isValid: false,
        error: {
          code: "BUCKET_NOT_FOUND",
          message: "Failed to access the specified bucket.",
          details: "Unable to perform HeadBucket operation.",
          suggestions: [
            "Confirm the bucket name.",
            "Ensure the bucket exists in the selected region.",
            "Verify the AWS credentials have s3:ListBucket permission.",
          ],
        },
      };
    }

    // ---- Step 2: Write Test ----
    try {
      const start = performance.now();
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: testKey,
          Body: "ok",
          ContentType: "text/plain",
        }),
      );
      latency.writeTest = performance.now() - start;
    } catch (err: any) {
      this.logger.error(
        `AWS S3 credential validation: write test failed: ${err?.message}`,
      );
      return {
        isValid: false,
        error: {
          code: STORAGE_VALIDATION_ERRORS.INSUFFICIENT_PERMISSIONS,
          message: "Bucket exists but write permission is denied.",
          details: err?.message,
          suggestions: [
            "Grant s3:PutObject to your IAM role.",
            "Ensure the bucket policy allows this principal.",
            "Check if the bucket uses object-lock or retention.",
          ],
        },
      };
    }

    // ---- Step 3: Delete Test ----
    try {
      const start = performance.now();
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: testKey,
        }),
      );
      latency.deleteTest = performance.now() - start;
    } catch (err: any) {
      this.logger.error(
        `AWS S3 credential validation: delete test failed: ${err?.message}`,
      );
      return {
        isValid: false,
        error: {
          code: STORAGE_VALIDATION_ERRORS.INSUFFICIENT_PERMISSIONS,
          message: "Write is allowed but delete permission is denied.",
          details: err?.message,
          suggestions: [
            "Grant s3:DeleteObject.",
            "Check object-lock or retention policies.",
          ],
        },
      };
    }

    // ---- All checks passed ----
    return {
      isValid: true,
      storageInfo: {
        bucketName: bucket,
        region: params.region,
        permissions: ["s3:ListBucket", "s3:PutObject", "s3:DeleteObject"],
        latency,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.s3Client!.send(
        new HeadBucketCommand({
          Bucket: this.config!.bucketName,
        }),
      );
      return true;
    } catch (error) {
      console.error("AWS S3 health check failed:", error);
      return false;
    }
  }

  isConfigured(): boolean {
    return (
      this.isInitialized &&
      !!this.s3Client &&
      !!this.config?.bucketName &&
      !!this.config?.accessKeyId &&
      !!this.config?.secretAccessKey
    );
  }

  getProviderInfo() {
    const f = STORAGE_PROVIDER_METADATA[STORAGE_PROVIDERS.AWS];
    return f satisfies StorageProviderMetadata;
  }

  // ---------- Helpers ----------
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
