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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const resend_verification_token_dto_1 = require("./dto/resend-verification-token.dto");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const app_exception_1 = require("../../common/dto/app-exception");
const error_code_constansts_1 = require("../../common/constants/error-code.constansts");
const verification_status_response_dto_1 = require("./dto/verification-status-response.dto");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async register(registerDto, response) {
        console.log("Registering user", registerDto);
        const result = await this.authService.register(registerDto);
        console.log("Registering user result", result);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.register.success',
            data: result,
            navigation: result.navigation,
        });
    }
    async login(loginDto, request, response) {
        this.logger.log({ loginDto });
        const result = await this.authService.login(loginDto);
        response.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        response.cookie('accessToken', result.tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/',
        });
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.login.success',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
            },
            navigation: result.navigation,
        });
    }
    async refreshToken(request, response) {
        const refreshToken = request.cookies?.refreshToken;
        if (!refreshToken) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.UNAUTHORIZED,
                code: error_code_constansts_1.ERROR_CODES.UNAUTHORIZED,
                message: 'Auth.refreshToken.tokenNotFound',
                userMessage: 'Refresh token not found',
                details: 'Please log in again to continue.',
            });
        }
        const result = await this.authService.refreshTokens(refreshToken);
        response.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        response.cookie('accessToken', result.tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.refreshToken.success',
            data: {
                accessToken: result.tokens.accessToken,
            },
        });
    }
    async logout(request, response) {
        await this.authService.logout(request.user['_id']);
        response.clearCookie('refreshToken');
        response.clearCookie('accessToken');
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.logout.success',
            data: null,
        });
    }
    async getCurrentUser(request) {
        const result = await this.authService.getCurrentUser(request.user['_id']);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.getCurrentUser.success',
            data: { user: result.user },
            navigation: result?.navigation,
        });
    }
    async changePassword(changePasswordDto, request, response) {
        await this.authService.changePassword(request.user['_id'], changePasswordDto);
        response.clearCookie('refreshToken');
        response.clearCookie('accessToken');
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.changePassword.success',
            data: null,
        });
    }
    async getEmailVerificationStatus(email) {
        const { navigation, ...rest } = await this.authService.getEmailVerificationStatus(email);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.getEmailVerificationStatus.success',
            data: new verification_status_response_dto_1.VerificationStatusResponseDto({
                ...rest
            }),
            navigation,
        });
    }
    async verifyEmail(dto) {
        const result = await this.authService.verifyEmail(dto.token);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.verifyEmail.success',
            data: result.user,
            navigation: result.navigation,
        });
    }
    async resendEmailVerification(dto) {
        await this.authService.resendEmailVerification(dto.email);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.resendVerification.success',
            data: null,
        });
    }
    async forgotPassword(email) {
        await this.authService.forgotPassword(email);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.forgotPassword.success',
            data: null,
        });
    }
    async resetPassword(token, newPassword) {
        await this.authService.resetPassword(token, newPassword);
        return api_response_dto_1.ApiResponseDto.success({
            message: 'Auth.resetPassword.success',
            data: null,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or username already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login user' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged in successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged out successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current user retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Current password is incorrect' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('verify-email/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get email verification status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verification status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getEmailVerificationStatus", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired verification token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resend email verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification email sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_verification_token_dto_1.ResendEmailVerificationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendEmailVerification", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent if email exists' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired reset token' }),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Body)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map