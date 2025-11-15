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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getUserProfile(request) {
        const userId = request.user['_id'];
        const user = await this.usersService.getUserProfile(userId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Users.getUserProfile.success',
            data: { user },
        });
    }
    async updateUserProfile(updateProfileDto, request) {
        const userId = request.user['_id'];
        const user = await this.usersService.updateUserProfile(userId, updateProfileDto);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Users.updateUserProfile.success',
            data: { user },
        });
    }
    async updateUserAvatar(avatarUrl, request) {
        const userId = request.user['_id'];
        const user = await this.usersService.updateUserAvatar(userId, avatarUrl);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Users.updateUserAvatar.success',
            data: { user },
        });
    }
    async deleteUserAccount(request) {
        const userId = request.user['_id'];
        await this.usersService.deleteUserAccount(userId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Users.deleteUserAccount.success',
            data: null,
        });
    }
    async getUserStats(request) {
        const userId = request.user['_id'];
        const stats = await this.usersService.getUserStats(userId);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Users.getUserStats.success',
            data: stats,
        });
    }
    async getUserFiles(paginationDto, request) {
        const userId = request.user['_id'];
        const { page = 1, limit = 10 } = paginationDto;
        const result = await this.usersService.getUserFiles(userId, page, limit);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Users.getUserFiles.success',
            data: {
                files: result.files,
                pagination: result.pagination,
            },
        });
    }
    async searchUsers(searchTerm, paginationDto) {
        const { page = 1, limit = 10 } = paginationDto;
        const result = await this.usersService.searchUsers(searchTerm, page, limit);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Users.searchUsers.success',
            data: {
                users: result.users,
                pagination: result.pagination,
            },
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Username already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_profile_dto_1.UpdateProfileDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserProfile", null);
__decorate([
    (0, common_1.Put)('avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user avatar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User avatar updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Body)('avatar')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserAvatar", null);
__decorate([
    (0, common_1.Delete)('account'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user account (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User account deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUserAccount", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics and analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('files'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user files with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User files retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserFiles", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search users (Admin functionality)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users search completed successfully' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map