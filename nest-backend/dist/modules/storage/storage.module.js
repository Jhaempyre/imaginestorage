"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const storage_service_1 = require("./storage.service");
const storage_controller_1 = require("./storage.controller");
const aws_storage_provider_1 = require("./providers/aws-storage.provider");
const gcp_storage_provider_1 = require("./providers/gcp-storage.provider");
const mongoose_1 = require("@nestjs/mongoose");
const user_storage_config_schema_1 = require("../../schemas/user-storage-config.schema");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_storage_config_schema_1.UserStorageConfig.name, schema: user_storage_config_schema_1.UserStorageConfigSchema },
            ]),
            platform_express_1.MulterModule.register({
                dest: './../public/temp',
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
        ],
        controllers: [storage_controller_1.StorageController],
        providers: [
            storage_service_1.StorageService,
            aws_storage_provider_1.AWSStorageProvider,
            gcp_storage_provider_1.GCPStorageProvider
        ],
        exports: [storage_service_1.StorageService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map