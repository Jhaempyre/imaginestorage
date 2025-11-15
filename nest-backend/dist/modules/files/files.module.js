"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const files_controller_1 = require("./files.controller");
const files_service_1 = require("./files.service");
const file_schema_1 = require("../../schemas/file.schema");
const storage_module_1 = require("../storage/storage.module");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: file_schema_1.File.name, schema: file_schema_1.FileSchema }]),
            storage_module_1.StorageModule,
            platform_express_1.MulterModule.registerAsync({
                useFactory: (configService) => ({
                    storage: multer.diskStorage({
                        destination: (req, file, cb) => {
                            const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
                            if (!fs.existsSync(uploadDir)) {
                                fs.mkdirSync(uploadDir, { recursive: true });
                            }
                            cb(null, uploadDir);
                        },
                        filename: (req, file, cb) => {
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                            const fileExtension = path.extname(file.originalname);
                            cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
                        }
                    }),
                    fileFilter: (req, file, cb) => {
                        const allowedTypes = configService.get('ALLOWED_FILE_TYPES')?.split(',') || [
                            'image/jpeg',
                            'image/png',
                            'image/gif',
                            'image/webp',
                            'application/pdf',
                            'text/plain',
                            'video/mp4',
                        ];
                        if (allowedTypes.includes(file.mimetype)) {
                            cb(null, true);
                        }
                        else {
                            cb(new Error(`File type ${file.mimetype} is not allowed`), false);
                        }
                    },
                    limits: {
                        fileSize: parseInt(configService.get('MAX_FILE_SIZE') || '500') * 1024 * 1024,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [files_controller_1.FilesController],
        providers: [files_service_1.FilesService],
        exports: [files_service_1.FilesService],
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map