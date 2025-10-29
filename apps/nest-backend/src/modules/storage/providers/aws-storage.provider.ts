import { Injectable } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
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
} from "@/common/constants/storage.constants";

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

  async validateCredentials() {
    // mock implementation
    return new Promise<StorageValidationResult>((resolve, reject) => {
      setTimeout(() => {
        resolve({
          isValid: false,
        });
      });
    });
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
}
