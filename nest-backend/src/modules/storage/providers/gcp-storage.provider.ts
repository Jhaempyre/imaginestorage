import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  IStorageProvider,
  UploadParams,
  UploadResult,
  DownloadUrlParams,
  DeleteParams,
  StorageConfig
} from '../interfaces/storage-provider.interface';
import { Storage } from '@google-cloud/storage';

export interface GCPConfig extends StorageConfig {
  "type": string,
  "project_id": string,
  "private_key_id": string,
  "private_key": string,
  "client_email": string,
  "client_id": string,
  "universe_domain": string,
  "bucket": string
}

@Injectable()
export class GCPStorageProvider implements IStorageProvider {
  readonly name = 'GCP Storage';
  readonly type = 'gcp' as const;

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
        universe_domain: config.universe_domain
      }
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
      throw new Error('GCP Storage provider not configured');
    }

    const { filePath, fileName, userId, mimeType } = params;
    const destination = `${userId}/${fileName}`;

    try {
      // Checking if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const bucket = this.storage!.bucket(this.bucketName!);
      const file = bucket.file(destination);

      // Upload file to GCP Storage
      await bucket.upload(filePath, {
        destination: destination,
        metadata: {
          contentType: mimeType,
          metadata: {
            userId,
            originalName: path.basename(filePath),
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Make the file public (optional - you can remove this if you want private files)
      await file.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${destination}`;
      const storageLocation = `gs://${this.bucketName}/${destination}`;

      return {
        storageLocation,
        fileName: destination,
        publicUrl,
        metadata: {
          bucket: this.bucketName,
          projectId: this.config!.project_id,
          key: destination
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload file to GCP Storage: ${error}`);
    }
  }

  async getDownloadUrl(params: DownloadUrlParams): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GCP Storage provider not configured');
    }

    const { fileName, expiresIn = 3600 } = params;

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const file = bucket.file(fileName);

      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000, // Convert to milliseconds
      });

      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error}`);
    }
  }

  async deleteFile(params: DeleteParams): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('GCP Storage provider not configured');
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
    return this.isInitialized &&
      !!this.storage &&
      !!this.config?.bucket &&
      !!this.config?.project_id &&
      !!this.config?.client_email;
  }

  getProviderInfo() {
    return {
      name: this.name,
      type: this.type,
      features: [
        'Signed URLs',
        'Public URLs',
        'Server-side encryption',
        'Versioning support',
        'Cross-region replication',
        'Lifecycle policies',
        'IAM integration'
      ],
      limitations: {
        maxFileSize: '5TB',
        maxObjectsPerBucket: 'Unlimited',
        maxBuckets: 'Project dependent'
      }
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const bucket = this.storage!.bucket(this.bucketName!);
      const [exists] = await bucket.exists();
      return exists;
    } catch (error) {
      console.error('GCP Storage health check failed:', error);
      return false;
    }
  }
}