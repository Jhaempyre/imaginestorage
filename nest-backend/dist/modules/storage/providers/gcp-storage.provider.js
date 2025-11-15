"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GCPStorageProvider = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const storage_1 = require("@google-cloud/storage");
let GCPStorageProvider = class GCPStorageProvider {
    constructor() {
        this.name = 'GCP Storage';
        this.type = 'gcp';
        this.isInitialized = false;
    }
    async initialize(config) {
        this.config = config;
        this.storage = new storage_1.Storage({
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
            const [exists] = await bucket.exists();
            if (!exists) {
                throw new Error(`Bucket ${this.bucketName} does not exist`);
            }
            this.isInitialized = true;
        }
        catch (error) {
            throw new Error(`Failed to initialize GCP Bucket: ${error}`);
        }
    }
    async uploadFile(params) {
        if (!this.isConfigured()) {
            throw new Error('GCP Storage provider not configured');
        }
        const { filePath, fileName, userId, mimeType } = params;
        const destination = `${userId}/${fileName}`;
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(destination);
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
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${destination}`;
            const storageLocation = `gs://${this.bucketName}/${destination}`;
            return {
                storageLocation,
                fileName: destination,
                publicUrl,
                metadata: {
                    bucket: this.bucketName,
                    projectId: this.config.project_id,
                    key: destination
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to upload file to GCP Storage: ${error}`);
        }
    }
    async getDownloadUrl(params) {
        if (!this.isConfigured()) {
            throw new Error('GCP Storage provider not configured');
        }
        const { fileName, expiresIn = 3600 } = params;
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(fileName);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresIn * 1000,
            });
            return signedUrl;
        }
        catch (error) {
            throw new Error(`Failed to generate download URL: ${error}`);
        }
    }
    async deleteFile(params) {
        if (!this.isConfigured()) {
            throw new Error('GCP Storage provider not configured');
        }
        const { fileName } = params;
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(fileName);
            await file.delete();
        }
        catch (error) {
            throw new Error(`Failed to delete file from GCP Storage: ${error}`);
        }
    }
    isConfigured() {
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
    async healthCheck() {
        if (!this.isConfigured()) {
            return false;
        }
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const [exists] = await bucket.exists();
            return exists;
        }
        catch (error) {
            console.error('GCP Storage health check failed:', error);
            return false;
        }
    }
};
exports.GCPStorageProvider = GCPStorageProvider;
exports.GCPStorageProvider = GCPStorageProvider = __decorate([
    (0, common_1.Injectable)()
], GCPStorageProvider);
//# sourceMappingURL=gcp-storage.provider.js.map