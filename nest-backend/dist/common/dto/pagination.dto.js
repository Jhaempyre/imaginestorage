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
exports.PaginationResponseDto = exports.PaginationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class PaginationDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number',
        minimum: 1,
        default: 1,
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 10,
        example: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
class PaginationResponseDto {
}
exports.PaginationResponseDto = PaginationResponseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current page number' }),
    __metadata("design:type", Number)
], PaginationResponseDto.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total number of pages' }),
    __metadata("design:type", Number)
], PaginationResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total number of items' }),
    __metadata("design:type", Number)
], PaginationResponseDto.prototype, "totalItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page' }),
    __metadata("design:type", Number)
], PaginationResponseDto.prototype, "itemsPerPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether there is a next page' }),
    __metadata("design:type", Boolean)
], PaginationResponseDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether there is a previous page' }),
    __metadata("design:type", Boolean)
], PaginationResponseDto.prototype, "hasPrevPage", void 0);
//# sourceMappingURL=pagination.dto.js.map