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
exports.GetFilesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
class GetFilesDto extends pagination_dto_1.PaginationDto {
    constructor() {
        super(...arguments);
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.GetFilesDto = GetFilesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search term for file names',
        example: 'document',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetFilesDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by MIME type',
        example: 'image/jpeg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetFilesDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort field',
        enum: ['createdAt', 'updatedAt', 'originalName', 'fileSize'],
        default: 'createdAt',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['createdAt', 'updatedAt', 'originalName', 'fileSize']),
    __metadata("design:type", String)
], GetFilesDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        enum: ['asc', 'desc'],
        default: 'desc',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], GetFilesDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=get-files.dto.js.map