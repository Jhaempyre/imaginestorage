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
exports.NavigationControlDto = exports.PaginationDto = exports.ApiResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApiResponseDto {
    constructor(init) {
        Object.assign(this, init);
    }
    static success({ message = 'Success', data, navigation, }) {
        return new ApiResponseDto({
            success: true,
            statusCode: 200,
            message,
            data,
            navigation,
        });
    }
    static error({ message, errorCode, errorUserMessage, errorDetails, suggestions, navigation, }) {
        return new ApiResponseDto({
            success: false,
            statusCode: 400,
            message,
            error: {
                code: errorCode,
                userMessage: errorUserMessage,
                details: errorDetails,
                suggestions,
            },
            navigation,
        });
    }
    static fromException(exception) {
        return new ApiResponseDto({
            success: false,
            statusCode: exception.statusCode,
            message: exception.message,
            error: {
                code: exception.code,
                userMessage: exception.userMessage,
                details: exception.details,
                suggestions: exception.suggestions,
            },
            navigation: exception.navigation,
        });
    }
}
exports.ApiResponseDto = ApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the request was successful' }),
    __metadata("design:type", Boolean)
], ApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code' }),
    __metadata("design:type", Number)
], ApiResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message' }),
    __metadata("design:type", String)
], ApiResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response data' }),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Navigation instructions for frontend',
        example: {
            route: '/dashboard',
            type: 'replace',
            reason: 'onboarding_completed'
        }
    }),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "navigation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Error details (if success is false)',
        example: {
            code: 'INVALID_CREDENTIALS',
            details: 'The provided credentials are invalid',
            suggestions: ['Check your access key', 'Verify permissions']
        }
    }),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "error", void 0);
class PaginationDto {
    constructor(currentPage, totalItems, itemsPerPage) {
        this.currentPage = currentPage;
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.totalPages = Math.ceil(totalItems / itemsPerPage);
        this.hasNextPage = currentPage < this.totalPages;
        this.hasPrevPage = currentPage > 1;
    }
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number', example: 1 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages', example: 10 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of items', example: 100 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "totalItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of items per page', example: 10 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "itemsPerPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a next page', example: true }),
    __metadata("design:type", Boolean)
], PaginationDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there is a previous page', example: false }),
    __metadata("design:type", Boolean)
], PaginationDto.prototype, "hasPrevPage", void 0);
class NavigationControlDto {
}
exports.NavigationControlDto = NavigationControlDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target route to navigate to',
        example: '/dashboard'
    }),
    __metadata("design:type", String)
], NavigationControlDto.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Navigation type',
        enum: ['push', 'replace'],
        example: 'replace'
    }),
    __metadata("design:type", String)
], NavigationControlDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for navigation',
        example: 'onboarding_completed'
    }),
    __metadata("design:type", String)
], NavigationControlDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Route parameters',
        example: { id: '123' }
    }),
    __metadata("design:type", Object)
], NavigationControlDto.prototype, "params", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'State to pass with navigation',
        example: { from: 'onboarding' }
    }),
    __metadata("design:type", Object)
], NavigationControlDto.prototype, "state", void 0);
//# sourceMappingURL=api-response.dto.js.map