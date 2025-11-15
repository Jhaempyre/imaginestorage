"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSStorageProvider = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");
let AWSStorageProvider = class AWSStorageProvider {
    constructor() {
        this.name = 'AWS S3';
        this.type = 'aws';
        this.isInitialized = false;
    }
    async initialize(config) {
        this.config = config;
        this.s3Client = new client_s3_1.S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            ...(config.endpoint && { endpoint: config.endpoint })
        });
        try {
            await this.s3Client.send(new client_s3_1.HeadBucketCommand({ Bucket: config.bucketName }));
            this.isInitialized = true;
        }
        catch (error) {
            throw new Error(`Failed to initialize AWS S3: ${error}`);
        }
    }
    async uploadFile(params) {
        if (!this.isConfigured()) {
            throw new Error('AWS S3 provider not configured');
        }
        const { filePath, fileName, userId, mimeType } = params;
        const key = `${userId}/${fileName}`;
        try {
            const fileStream = fs.createReadStream(filePath);
            const fileStats = fs.statSync(filePath);
            console.log({
                Bucket: this.config.bucketName,
                Key: key,
                ContentType: mimeType,
                ContentLength: fileStats.size,
                Metadata: {
                    userId,
                    originalName: path.basename(filePath),
                    uploadedAt: new Date().toISOString()
                }
            });
            const uploadCommand = new client_s3_1.PutObjectCommand({
                Bucket: this.config.bucketName,
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
            await this.s3Client.send(uploadCommand);
            const storageLocation = `s3://${this.config.bucketName}/${key}`;
            return {
                storageLocation,
                fileName: key,
                metadata: {
                    bucket: this.config.bucketName,
                    region: this.config.region,
                    key
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to upload file to AWS S3: ${error}`);
        }
    }
    async getDownloadUrl(params) {
        if (!this.isConfigured()) {
            throw new Error('AWS S3 provider not configured');
        }
        const { fileName, expiresIn = 3600 } = params;
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.config.bucketName,
                Key: fileName,
            });
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
            return signedUrl;
        }
        catch (error) {
            throw new Error(`Failed to generate download URL: ${error}`);
        }
    }
    async deleteFile(params) {
        if (!this.isConfigured()) {
            throw new Error('AWS S3 provider not configured');
        }
        const { fileName } = params;
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.config.bucketName,
                Key: fileName,
            });
            await this.s3Client.send(command);
        }
        catch (error) {
            throw new Error(`Failed to delete file from AWS S3: ${error}`);
        }
    }
    isConfigured() {
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
    async healthCheck() {
        if (!this.isConfigured()) {
            return false;
        }
        try {
            await this.s3Client.send(new client_s3_1.HeadBucketCommand({
                Bucket: this.config.bucketName
            }));
            return true;
        }
        catch (error) {
            console.error('AWS S3 health check failed:', error);
            return false;
        }
    }
};
exports.AWSStorageProvider = AWSStorageProvider;
exports.AWSStorageProvider = AWSStorageProvider = __decorate([
    (0, common_1.Injectable)()
], AWSStorageProvider);
//# sourceMappingURL=aws-storage.provider.js.map