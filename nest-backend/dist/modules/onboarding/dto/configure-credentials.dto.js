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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureCredentialsDto = exports.LocalCredentialsDto = exports.AzureCredentialsDto = exports.GCPCredentialsDto = exports.AWSCredentialsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AWSCredentialsDto {
}
exports.AWSCredentialsDto = AWSCredentialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'AWS Access Key ID',
        example: 'AKIAIOSFODNN7EXAMPLE',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(16),
    (0, class_validator_1.MaxLength)(32),
    (0, class_validator_1.Matches)(/^AKIA[0-9A-Z]{16}$/, {
        message: 'Invalid AWS Access Key ID format'
    }),
    __metadata("design:type", String)
], AWSCredentialsDto.prototype, "accessKeyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'AWS Secret Access Key',
        example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(40),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], AWSCredentialsDto.prototype, "secretAccessKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'AWS Region',
        example: 'us-east-1',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z]{2}-[a-z]+-\d{1}$/, {
        message: 'Invalid AWS region format'
    }),
    __metadata("design:type", String)
], AWSCredentialsDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'S3 Bucket Name',
        example: 'my-app-storage-bucket',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(63),
    (0, class_validator_1.Matches)(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/, {
        message: 'Invalid S3 bucket name format'
    }),
    __metadata("design:type", String)
], AWSCredentialsDto.prototype, "bucketName", void 0);
class GCPCredentialsDto {
}
exports.GCPCredentialsDto = GCPCredentialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'GCP Project ID',
        example: 'my-gcp-project-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(30),
    (0, class_validator_1.Matches)(/^[a-z][a-z0-9-]*[a-z0-9]$/, {
        message: 'Invalid GCP project ID format'
    }),
    __metadata("design:type", String)
], GCPCredentialsDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Service Account Key (JSON content)',
        example: '{"type": "service_account", "project_id": "..."}',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GCPCredentialsDto.prototype, "keyFile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'GCS Bucket Name',
        example: 'my-gcs-bucket',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(63),
    __metadata("design:type", String)
], GCPCredentialsDto.prototype, "bucketName", void 0);
class AzureCredentialsDto {
}
exports.AzureCredentialsDto = AzureCredentialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Azure Storage Account Name',
        example: 'mystorageaccount',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(24),
    (0, class_validator_1.Matches)(/^[a-z0-9]+$/, {
        message: 'Storage account name must contain only lowercase letters and numbers'
    }),
    __metadata("design:type", String)
], AzureCredentialsDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Azure Storage Account Key',
        example: 'DefaultEndpointsProtocol=https;AccountName=...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AzureCredentialsDto.prototype, "accountKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Azure Blob Container Name',
        example: 'my-container',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(63),
    (0, class_validator_1.Matches)(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
        message: 'Invalid container name format'
    }),
    __metadata("design:type", String)
], AzureCredentialsDto.prototype, "containerName", void 0);
class LocalCredentialsDto {
}
exports.LocalCredentialsDto = LocalCredentialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Local storage path',
        example: '/var/www/storage',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\/[a-zA-Z0-9/_-]+$/, {
        message: 'Invalid storage path format'
    }),
    __metadata("design:type", String)
], LocalCredentialsDto.prototype, "storagePath", void 0);
class ConfigureCredentialsDto {
}
exports.ConfigureCredentialsDto = ConfigureCredentialsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        oneOf: [
            { $ref: '#/components/schemas/AWSCredentialsDto' },
            { $ref: '#/components/schemas/GCPCredentialsDto' },
            { $ref: '#/components/schemas/AzureCredentialsDto' },
            { $ref: '#/components/schemas/LocalCredentialsDto' },
        ]
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], ConfigureCredentialsDto.prototype, "credentials", void 0);
//# sourceMappingURL=configure-credentials.dto.js.map