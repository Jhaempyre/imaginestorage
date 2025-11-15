"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const aws_storage_provider_1 = require("./providers/aws-storage.provider");
const gcp_storage_provider_1 = require("./providers/gcp-storage.provider");
const user_storage_config_schema_1 = require("../../schemas/user-storage-config.schema");
let StorageService = class StorageService {
    constructor(configService, awsProvider, gcpProvider, userStorageConfigModel) {
        this.configService = configService;
        this.awsProvider = awsProvider;
        this.gcpProvider = gcpProvider;
        this.userStorageConfigModel = userStorageConfigModel;
        this.providers = new Map();
        this.registerProvider('aws', this.awsProvider);
        this.registerProvider('gcp', this.gcpProvider);
    }
    async onModuleInit() {
    }
    registerProvider(type, provider) {
        this.providers.set(type, provider);
    }
    async _getActiveProviderForUser(userId) {
        const testGCPConfig = {
            "type": "service_account",
            "project_id": "your-project-id",
            "private_key_id": "your-private-key-id",
            "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
            "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
            "client_id": "your-client-id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/your-service-account%40your-project-id.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com",
            "bucket": "your-bucket-name"
        };
        const provider = this.providers.get('gcp');
        if (!provider) {
            throw new Error('GCP provider not found');
        }
        await provider.initialize(testGCPConfig);
        if (!provider.isConfigured()) {
            throw new Error('Storage provider is not configured');
        }
        return provider;
    }
    async _getActiveProviderForUserFromDB(userId) {
        const userConfig = await this.userStorageConfigModel.findOne({ userId, isActive: true }).select('provider credentials');
        if (!userConfig) {
            throw new Error('No active storage config found for user');
        }
        const provider = this.providers.get(userConfig.provider);
        if (!provider) {
            throw new Error(`Provider ${userConfig.provider} not found`);
        }
        await provider.initialize(userConfig.credentials);
        if (!provider.isConfigured()) {
            throw new Error('Storage provider is not configured');
        }
        return provider;
    }
    async getUserStorageConfig(userId) {
        return {
            provider: 'gcp',
            isValidated: true,
            lastValidatedAt: new Date(),
            validationError: null,
            isActive: true,
            createdAt: new Date()
        };
    }
    async uploadFile(userId, params) {
        const provider = await this._getActiveProviderForUser(userId);
        const result = await provider.uploadFile(params);
        return {
            ...result,
            provider: provider.type,
        };
    }
    async getDownloadUrl(userId, params) {
        const provider = await this._getActiveProviderForUser(userId);
        return provider.getDownloadUrl(params);
    }
    async deleteFile(userId, params) {
        const provider = await this._getActiveProviderForUser(userId);
        return provider.deleteFile(params);
    }
    async healthCheck(userId) {
        const provider = await this._getActiveProviderForUser(userId);
        const healthy = await provider.healthCheck();
        return {
            provider: provider.name,
            healthy
        };
    }
    async healthCheckAll() {
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
    async testGCPConfiguration(userId, gcpConfig) {
        try {
            const gcpProvider = new gcp_storage_provider_1.GCPStorageProvider();
            await gcpProvider.initialize(gcpConfig);
            return await gcpProvider.healthCheck();
        }
        catch (error) {
            console.error('GCP configuration test failed:', error);
            return false;
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, mongoose_1.InjectModel)(user_storage_config_schema_1.UserStorageConfig.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        aws_storage_provider_1.AWSStorageProvider,
        gcp_storage_provider_1.GCPStorageProvider,
        mongoose_2.Model])
], StorageService);
//# sourceMappingURL=storage.service.js.map