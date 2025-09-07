import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { 
  IStorageProvider, 
  UploadParams, 
  UploadResult, 
  DownloadUrlParams, 
  DeleteParams, 
  StorageConfig 
} from '../interfaces/IStorageProvider';

export interface AWSConfig extends StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
  endpoint?: string; // For S3-compatible services
}

export class AWSStorageProvider implements IStorageProvider {
  readonly name = 'AWS S3';
  readonly type = 'aws' as const;
  
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
      ...(config.endpoint && { endpoint: config.endpoint })
    });

    // Test the connection
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: config.bucketName }));
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize AWS S3: ${error}`);
    }
  }

  async uploadFile(params: UploadParams): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error('AWS S3 provider not configured');
    }

    const { filePath, fileName, userId, mimeType } = params;
    const key = `${userId}/${fileName}`;

    try {
      const fileStream = fs.createReadStream(filePath);
      const fileStats = fs.statSync(filePath);

      const uploadCommand = new PutObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
        Body: fileStream,
        ContentType: mimeType,
        ContentLength: fileStats.size,
        Metadata: {
          userId,
          originalName: path.basename(filePath),
          uploadedAt: new Date().toISOString()
        }
      });

      await this.s3Client!.send(uploadCommand);

      const storageLocation = `s3://${this.config!.bucketName}/${key}`;
      
      return {
        storageLocation,
        fileName: key,
        metadata: {
          bucket: this.config!.bucketName,
          region: this.config!.region,
          key
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload file to AWS S3: ${error}`);
    }
  }

  async getDownloadUrl(params: DownloadUrlParams): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('AWS S3 provider not configured');
    }

    const { fileName, expiresIn = 3600 } = params;

    try {
      const command = new GetObjectCommand({
        Bucket: this.config!.bucketName,
        Key: fileName,
      });

      const signedUrl = await getSignedUrl(this.s3Client!, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error}`);
    }
  }

  async deleteFile(params: DeleteParams): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('AWS S3 provider not configured');
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

  isConfigured(): boolean {
    return this.isInitialized && 
           !!this.s3Client && 
           !!this.config?.bucketName &&
           !!this.config?.accessKeyId &&
           !!this.config?.secretAccessKey;
  }

  getProviderInfo() {
    return {
      name: this.name,
      type: this.type,
      features: [
        'Signed URLs',
        'Server-side encryption',
        'Versioning support',
        'Cross-region replication',
        'Lifecycle policies'
      ],
      limitations: {
        maxFileSize: '5TB',
        maxObjectsPerBucket: 'Unlimited',
        maxBuckets: 100
      }
    };
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.s3Client!.send(new HeadBucketCommand({ 
        Bucket: this.config!.bucketName 
      }));
      return true;
    } catch (error) {
      console.error('AWS S3 health check failed:', error);
      return false;
    }
  }
}