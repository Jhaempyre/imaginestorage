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
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const storage_constants_1 = require("../../common/constants/storage.constants");
const navigation_service_1 = require("../../common/services/navigation.service");
const user_storage_config_schema_1 = require("../../schemas/user-storage-config.schema");
const user_schema_1 = require("../../schemas/user.schema");
const app_exception_1 = require("../../common/dto/app-exception");
const error_code_constansts_1 = require("../../common/constants/error-code.constansts");
const routes_constants_1 = require("../../common/constants/routes.constants");
let OnboardingService = class OnboardingService {
    constructor(userModel, storageConfigModel, navigationService) {
        this.userModel = userModel;
        this.storageConfigModel = storageConfigModel;
        this.navigationService = navigationService;
    }
    async getOnboardingStatus(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new app_exception_1.AppException({
                    code: error_code_constansts_1.ERROR_CODES.NOT_FOUND,
                    message: 'Onboarding.getOnboardingStatus.userNotFound',
                    userMessage: 'User not found',
                    details: 'Please check your credentials and try again.',
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                });
            }
            if (user.isOnboardingComplete) {
                const storageConfig = await this.storageConfigModel.findOne({
                    userId: new mongoose_2.Types.ObjectId(userId),
                    isActive: true
                });
                return {
                    isOnboardingComplete: true,
                    currentStep: storage_constants_1.ONBOARDING_STEPS.COMPLETED,
                    hasStorageConfig: !!storageConfig,
                    storageProvider: storageConfig?.provider,
                };
            }
            const existingConfig = await this.storageConfigModel.findOne({
                userId: new mongoose_2.Types.ObjectId(userId),
                isActive: true
            });
            if (!existingConfig) {
                return ({
                    isOnboardingComplete: false,
                    currentStep: storage_constants_1.ONBOARDING_STEPS.CHOOSE_PROVIDER,
                    hasStorageConfig: false,
                    availableProviders: Object.values(storage_constants_1.STORAGE_PROVIDER_METADATA),
                });
            }
            if (existingConfig && !existingConfig.provider) {
                return ({
                    isOnboardingComplete: false,
                    currentStep: storage_constants_1.ONBOARDING_STEPS.CHOOSE_PROVIDER,
                    hasStorageConfig: false,
                    availableProviders: Object.values(storage_constants_1.STORAGE_PROVIDER_METADATA),
                });
            }
            else {
                return {
                    isOnboardingComplete: false,
                    currentStep: storage_constants_1.ONBOARDING_STEPS.CONFIGURE_CREDENTIALS,
                    hasStorageConfig: true,
                    selectedProvider: existingConfig.provider,
                    requiredFields: storage_constants_1.STORAGE_PROVIDER_METADATA[existingConfig.provider].fieldDefinitions,
                };
            }
        }
        catch (error) {
            console.log({ "error": error });
            throw new app_exception_1.AppException({
                code: error_code_constansts_1.ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Onboarding.getOnboardingStatus.unknownError',
                userMessage: 'An unknown error occurred',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
    async chooseProvider(userId, chooseProviderDto) {
        try {
            console.log({ "chooseProviderDto": chooseProviderDto });
            const { provider } = chooseProviderDto;
            if (!storage_constants_1.STORAGE_PROVIDER_METADATA[provider]) {
                throw new app_exception_1.AppException({
                    code: error_code_constansts_1.ERROR_CODES.BAD_REQUEST,
                    message: 'Onboarding.chooseProvider.unsupportedProvider',
                    userMessage: 'Unsupported storage provider',
                    details: `Provider: ${provider}`,
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                });
            }
            const existingConfig = await this.storageConfigModel.findOne({
                userId: new mongoose_2.Types.ObjectId(userId),
                isActive: true
            });
            if (existingConfig) {
                existingConfig.provider = provider;
                existingConfig.credentials = {};
                existingConfig.isValidated = false;
                existingConfig.validationError = null;
                await existingConfig.save();
            }
            else {
                await this.storageConfigModel.create({
                    userId: new mongoose_2.Types.ObjectId(userId),
                    provider,
                    credentials: {},
                    isValidated: false,
                });
            }
            const providerMetadata = storage_constants_1.STORAGE_PROVIDER_METADATA[provider];
            return {
                provider,
                requiredFields: Object.values(providerMetadata.fieldDefinitions),
                navigation: {
                    route: routes_constants_1.FRONTEND_ROUTES.ONBOARDING.STEP_2,
                    type: routes_constants_1.NAVIGATION_TYPES.PUSH,
                },
            };
        }
        catch (error) {
            console.log({ "error": error });
            throw new app_exception_1.AppException({
                code: error_code_constansts_1.ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Onboarding.chooseProvider.unknownError',
                userMessage: 'An unknown error occurred',
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
    async configureCredentials(userId, configureCredentialsDto) {
        const { credentials } = configureCredentialsDto;
        const storageConfig = await this.storageConfigModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            isActive: true
        });
        if (!storageConfig) {
            throw new app_exception_1.AppException({
                code: error_code_constansts_1.ERROR_CODES.BAD_REQUEST,
                message: 'Onboarding.configureCredentials.noStorageProviderSelected',
                userMessage: 'No storage provider selected',
                details: 'Please select a storage provider first.',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            });
        }
        this.validateCredentialsFormat(storageConfig.provider, credentials);
        storageConfig.credentials = credentials;
        storageConfig.isValidated = false;
        storageConfig.validationError = null;
        try {
            const validationResult = await this.validateCredentialsWithProvider(storageConfig.provider, credentials);
            if (!validationResult.isValid) {
                storageConfig.validationError = validationResult.error?.message || 'Validation failed';
                await storageConfig.save();
                throw new app_exception_1.AppException({
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    code: error_code_constansts_1.ERROR_CODES.INVALID_CREDENTIALS,
                    message: 'Onboarding.configureCredentials.invalidCredentials',
                    userMessage: 'Invalid credentials',
                    details: validationResult.error?.message || 'Validation failed',
                });
            }
            storageConfig.isValidated = true;
            storageConfig.lastValidatedAt = new Date();
            await storageConfig.save();
            await this.userModel.findByIdAndUpdate(userId, {
                isOnboardingComplete: true,
                onboardingCompletedAt: new Date(),
            });
            const navigation = this.navigationService.getOnboardingNavigation(storage_constants_1.ONBOARDING_STEPS.CONFIGURE_CREDENTIALS);
            return {
                success: true,
                provider: storageConfig.provider,
                isValidated: true,
                validatedAt: storageConfig.lastValidatedAt,
                storageInfo: validationResult.storageInfo,
                user: {
                    isOnboardingComplete: true,
                    onboardingCompletedAt: new Date(),
                },
                navigation,
            };
        }
        catch (error) {
            storageConfig.validationError = error.message;
            await storageConfig.save();
            throw new common_1.BadRequestException({
                message: 'Storage credentials validation failed',
                error: {
                    code: 'VALIDATION_ERROR',
                    details: error.message,
                    suggestions: this.getValidationSuggestions(storageConfig.provider),
                }
            });
        }
    }
    validateCredentialsFormat(provider, credentials) {
        const requiredFields = storage_constants_1.STORAGE_PROVIDER_METADATA[provider].requiredFields;
        const missingFields = requiredFields.filter(field => !credentials[field]);
        if (missingFields.length > 0) {
            throw new common_1.BadRequestException(`Missing required fields for ${provider}: ${missingFields.join(', ')}`);
        }
        switch (provider) {
            case 'aws':
                this.validateAWSCredentials(credentials);
                break;
            case 'gcp':
                this.validateGCPCredentials(credentials);
                break;
            case 'azure':
                this.validateAzureCredentials(credentials);
                break;
            case 'local':
                this.validateLocalCredentials(credentials);
                break;
        }
    }
    validateAWSCredentials(credentials) {
        if (!credentials.accessKeyId?.match(/^AKIA[0-9A-Z]{16}$/)) {
            throw new common_1.BadRequestException('Invalid AWS Access Key ID format');
        }
        if (!credentials.secretAccessKey || credentials.secretAccessKey.length !== 40) {
            throw new common_1.BadRequestException('Invalid AWS Secret Access Key format');
        }
        if (!credentials.region?.match(/^[a-z]{2}-[a-z]+-\d{1}$/)) {
            throw new common_1.BadRequestException('Invalid AWS region format');
        }
        if (!credentials.bucketName?.match(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/)) {
            throw new common_1.BadRequestException('Invalid S3 bucket name format');
        }
    }
    validateGCPCredentials(credentials) {
        try {
            const keyFile = JSON.parse(credentials.keyFile || '');
            if (!keyFile.type || keyFile.type !== 'service_account') {
                throw new Error('Invalid service account key file');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid GCP service account key file format');
        }
        if (!credentials.projectId?.match(/^[a-z][a-z0-9-]*[a-z0-9]$/)) {
            throw new common_1.BadRequestException('Invalid GCP project ID format');
        }
    }
    validateAzureCredentials(credentials) {
        if (!credentials.accountName?.match(/^[a-z0-9]+$/)) {
            throw new common_1.BadRequestException('Invalid Azure storage account name format');
        }
        if (!credentials.containerName?.match(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)) {
            throw new common_1.BadRequestException('Invalid Azure container name format');
        }
    }
    validateLocalCredentials(credentials) {
        if (!credentials.storagePath?.match(/^\/[a-zA-Z0-9/_-]+$/)) {
            throw new common_1.BadRequestException('Invalid storage path format');
        }
    }
    async validateCredentialsWithProvider(provider, credentials) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            isValid: false,
            storageInfo: {
                bucketName: credentials.bucketName || credentials.containerName || 'storage',
                region: credentials.region || 'default',
                permissions: ['read', 'write', 'delete'],
                availableSpace: 'unlimited',
            },
        };
    }
    getValidationSuggestions(provider) {
        const suggestions = {
            aws: [
                'Verify your AWS Access Key ID and Secret Access Key',
                'Ensure the IAM user has S3 permissions',
                'Check if the bucket exists and is accessible',
                'Verify the AWS region is correct',
            ],
            gcp: [
                'Verify your GCP project ID is correct',
                'Ensure the service account has Storage permissions',
                'Check if the bucket exists and is accessible',
                'Verify the service account key file is valid',
            ],
            azure: [
                'Verify your Azure storage account name and key',
                'Ensure the storage account is active',
                'Check if the container exists and is accessible',
                'Verify the account key is correct',
            ],
            local: [
                'Verify the storage path exists',
                'Ensure the application has write permissions',
                'Check if the directory is accessible',
            ],
        };
        return suggestions[provider] || ['Please check your credentials and try again'];
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_storage_config_schema_1.UserStorageConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        navigation_service_1.NavigationService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map