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
exports.UserStorageConfigSchema = exports.UserStorageConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserStorageConfig = class UserStorageConfig {
};
exports.UserStorageConfig = UserStorageConfig;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UserStorageConfig.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['aws', 'gcp', 'azure', 'local'],
        index: true
    }),
    __metadata("design:type", String)
], UserStorageConfig.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: Object,
        select: false
    }),
    __metadata("design:type", Object)
], UserStorageConfig.prototype, "credentials", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], UserStorageConfig.prototype, "isValidated", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], UserStorageConfig.prototype, "lastValidatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], UserStorageConfig.prototype, "validationError", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], UserStorageConfig.prototype, "isActive", void 0);
exports.UserStorageConfig = UserStorageConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], UserStorageConfig);
exports.UserStorageConfigSchema = mongoose_1.SchemaFactory.createForClass(UserStorageConfig);
exports.UserStorageConfigSchema.index({ userId: 1, isActive: 1 });
exports.UserStorageConfigSchema.index({ provider: 1, isValidated: 1 });
exports.UserStorageConfigSchema.methods.getMaskedCredentials = function () {
    const masked = {};
    switch (this.provider) {
        case 'aws':
            masked.accessKeyId = this.credentials.accessKeyId?.replace(/(.{4}).*(.{4})/, '$1***$2');
            masked.region = this.credentials.region;
            masked.bucketName = this.credentials.bucketName;
            break;
        case 'gcp':
            masked.projectId = this.credentials.projectId;
            masked.bucketName = this.credentials.bucketName;
            break;
        case 'azure':
            masked.accountName = this.credentials.accountName;
            masked.containerName = this.credentials.containerName;
            break;
        case 'local':
            masked.storagePath = this.credentials.storagePath;
            break;
    }
    return masked;
};
exports.UserStorageConfigSchema.methods.validateRequiredFields = function () {
    const requiredFields = {
        aws: ['accessKeyId', 'secretAccessKey', 'region', 'bucketName'],
        gcp: ['projectId', 'keyFile', 'bucketName'],
        azure: ['accountName', 'accountKey', 'containerName'],
        local: ['storagePath'],
    };
    const required = requiredFields[this.provider] || [];
    const missingFields = required.filter(field => !this.credentials[field]);
    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
};
exports.UserStorageConfigSchema.statics.findByUserId = function (userId) {
    return this.findOne({ userId, isActive: true });
};
exports.UserStorageConfigSchema.statics.findValidatedConfigs = function () {
    return this.find({ isValidated: true, isActive: true });
};
//# sourceMappingURL=user-storage-config.schema.js.map