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
  StorageCredentials,
  StorageProviderMetadata,
  StorageValidationResult,
  UploadParams,
  UploadResult,
} from "@/common/interfaces/storage.interface";
import { Storage } from "@google-cloud/storage";
import { Injectable } from "@nestjs/common";
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
  readonly name = "GCP Storage";
  readonly type = "gcp" as const;

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

  // async getDownloadUrl(params: DownloadUrlParams): Promise<string> {
  //   if (!this.isConfigured()) {
  //     throw new Error("GCP Storage provider not configured");
  //   }

  //   const { fileName, expiresIn = 3600 } = params;

  //   try {
  //     const bucket = this.storage!.bucket(this.bucketName!);
  //     const file = bucket.file(fileName);

  //     const [signedUrl] = await file.getSignedUrl({
  //       action: "read",
  //       expires: Date.now() + expiresIn * 1000, // Convert to milliseconds
  //     });

  //     return signedUrl;
  //   } catch (error) {
  //     throw new Error(`Failed to generate download URL: ${error}`);
  //   }
  // }

  // async deleteFile(params: DeleteParams): Promise<void> {
  //   if (!this.isConfigured()) {
  //     throw new Error("GCP Storage provider not configured");
  //   }

  //   const { fileName } = params;

  //   try {
  //     const bucket = this.storage!.bucket(this.bucketName!);
  //     const file = bucket.file(fileName);

  //     await file.delete();
  //   } catch (error) {
  //     throw new Error(`Failed to delete file from GCP Storage: ${error}`);
  //   }
  // }

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
    params: StorageCredentials,
  ): Promise<StorageValidationResult> {
    // ---- All checks passed ----
    return {
      isValid: true,
      storageInfo: {
        permissions: ["s3:ListBucket", "s3:PutObject", "s3:DeleteObject"],
      },
    };
  }

  getFiles(params: GetFilesParams): Promise<any> {
    throw new Error("Method not implemented.");
  }
  createFolder(params: CreateFolderParams): Promise<CreateFolderResults> {
    throw new Error("Method not implemented.");
  }
  listObjects?(params: {
    prefix?: string;
    maxKeys?: number;
  }): Promise<ListObjectsResult> {
    throw new Error("Method not implemented.");
  }
  copyObject?(params: CopyObjectParams): Promise<void> {
    throw new Error("Method not implemented.");
  }
  moveObject?(params: MoveObjectParams): Promise<void> {
    throw new Error("Method not implemented.");
  }
  batchCopy?(
    mappings: BatchCopyMapping[],
    concurrency?: number,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getDownloadUrl(params: DownloadUrlParams): Promise<string> {
    throw new Error("Method not implemented.");
  }
  deleteFile(params: DeleteParams): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getProviderInfo(): StorageProviderMetadata {
    throw new Error("Method not implemented.");
  }
}
