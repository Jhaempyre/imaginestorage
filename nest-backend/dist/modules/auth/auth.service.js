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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const navigation_service_1 = require("../../common/services/navigation.service");
const user_storage_config_schema_1 = require("../../schemas/user-storage-config.schema");
const user_schema_1 = require("../../schemas/user.schema");
const app_exception_1 = require("../../common/dto/app-exception");
const error_code_constansts_1 = require("../../common/constants/error-code.constansts");
const routes_constants_1 = require("../../common/constants/routes.constants");
let AuthService = AuthService_1 = class AuthService {
    constructor(userModel, storageConfigModel, jwtService, configService, navigationService) {
        this.userModel = userModel;
        this.storageConfigModel = storageConfigModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.navigationService = navigationService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const { email, username, password, firstName, lastName } = registerDto;
        const existingUser = await this.userModel.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new app_exception_1.AppException({
                    code: error_code_constansts_1.ERROR_CODES.EMAIL_ALREADY_EXISTS,
                    message: 'Auth.register.emailAlreadyExists',
                    userMessage: 'Email already exists',
                    details: 'Please use a different email address.',
                    statusCode: common_1.HttpStatus.CONFLICT,
                });
            }
            if (existingUser.username === username) {
                throw new app_exception_1.AppException({
                    code: error_code_constansts_1.ERROR_CODES.USERNAME_ALREADY_EXISTS,
                    message: 'Auth.register.usernameAlreadyExists',
                    userMessage: 'Username already exists',
                    details: 'Please use a different username.',
                    statusCode: common_1.HttpStatus.CONFLICT,
                });
            }
        }
        const user = new this.userModel({
            firstName,
            lastName,
            email,
            username,
            password,
        });
        user.generateEmailVerificationToken();
        await user.save();
        this.logger.debug(`Mock email sent to ${user.email}, token: ${user.emailVerificationToken}`);
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;
        return {
            user: userResponse,
            navigation: this.navigationService.getAuthNavigation('register', user)
        };
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.emailOrUsername, loginDto.password);
        console.log({ user, api: 'login' });
        if (!user) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.UNAUTHORIZED,
                code: error_code_constansts_1.ERROR_CODES.INVALID_CREDENTIALS,
                message: 'Auth.login.invalidCredentials',
                userMessage: 'Invalid credentials',
            });
        }
        if (!user.isEmailVerified) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.UNAUTHORIZED,
                code: error_code_constansts_1.ERROR_CODES.EMAIL_NOT_VERIFIED,
                message: 'Auth.login.emailNotVerified',
                userMessage: 'Email not verified',
                navigation: {
                    route: `${routes_constants_1.FRONTEND_ROUTES.AUTH.VERIFY_EMAIL}/e/${user.email}`,
                    type: 'replace',
                    reason: 'email_verification_required'
                },
            });
        }
        user.lastLoginAt = new Date();
        const tokens = await this.generateTokens(user._id);
        user.refreshToken = tokens.refreshToken;
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.refreshToken;
        const existingConfig = await this.storageConfigModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userResponse._id),
            isActive: true
        });
        return {
            user: userResponse,
            tokens,
            navigation: this.navigationService.getAuthNavigation('login', user, existingConfig)
        };
    }
    async validateUser(emailOrUsername, password) {
        const user = await this.userModel.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername },
            ],
            isActive: true,
            deletedAt: null,
        });
        if (user && await user.comparePassword(password)) {
            return user;
        }
        return null;
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('REFRESH_TOKEN_SECRET'),
            });
            const user = await this.userModel.findById(payload.sub);
            if (!user || !user.isActive || user.deletedAt || user.refreshToken !== refreshToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokens = await this.generateTokens(user._id);
            user.refreshToken = tokens.refreshToken;
            await user.save();
            return { tokens };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.userModel.findByIdAndUpdate(userId, {
            refreshToken: null,
        });
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        user.password = newPassword;
        user.refreshToken = null;
        await user.save();
    }
    async getEmailVerificationStatus(email) {
        let user = await this.userModel.findOne({ email }).select('+isEmailVerified');
        if (!user) {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                code: error_code_constansts_1.ERROR_CODES.NOT_FOUND,
                message: 'Auth.getEmailVerificationStatus.userNotFound',
                userMessage: 'User not found',
            });
        }
        if (user.isEmailVerified) {
            return {
                isEmailVerified: true,
                isTokenExpired: false,
                expirationTime: process.env.EMAIL_VERIFICATION_EXPIRY || '24h',
                resendCooldown: 0,
                navigation: null
            };
        }
        if (!user.isEmailVerified && user.emailVerificationExpiry < new Date()) {
            await this.resendEmailVerification(email);
        }
        user = await this.userModel.findOne({ email }).select('+isEmailVerified');
        const tokenCreationTime = user.emailVerificationExpiry.getTime() - 24 * 60 * 60 * 1000;
        const cooldownTimeMs = Math.max(tokenCreationTime - Date.now() + 60000, 0);
        const cooldownTime = Math.floor(cooldownTimeMs / 1000);
        return {
            isEmailVerified: user.isEmailVerified,
            isTokenExpired: user.emailVerificationExpiry < new Date(),
            expirationTime: process.env.EMAIL_VERIFICATION_EXPIRY || '24h',
            resendCooldown: cooldownTime,
            navigation: user.isEmailVerified ? {
                route: this.navigationService.getAuthNavigation('verify-email').route,
                type: routes_constants_1.NAVIGATION_TYPES.PUSH
            } : null
        };
    }
    async verifyEmail(token) {
        const user = await this.userModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpiry: { $gt: new Date() },
        });
        if (!user) {
            throw new app_exception_1.AppException({
                code: error_code_constansts_1.ERROR_CODES.BAD_REQUEST,
                message: 'Auth.verifyEmail.invalidOrExpiredToken',
                userMessage: 'Invalid or expired verification token',
                details: 'Please try requesting a new verification email.',
                statusCode: common_1.HttpStatus.BAD_REQUEST,
            });
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpiry = null;
        await user.save();
        return {
            user: {
                isEmailVerified: true,
                isOnboardingComplete: user.isOnboardingComplete,
            },
            navigation: null,
        };
    }
    async resendEmailVerification(email) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.isEmailVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        user.generateEmailVerificationToken();
        await user.save();
        this.logger.debug(`Mock email sent to ${user.email}, token: ${user.emailVerificationToken}`);
    }
    async forgotPassword(email) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            return;
        }
        user.generatePasswordResetToken();
        await user.save();
    }
    async resetPassword(token, newPassword) {
        const user = await this.userModel.findOne({
            passwordResetToken: token,
            passwordResetExpiry: { $gt: new Date() },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        user.password = newPassword;
        user.passwordResetToken = null;
        user.passwordResetExpiry = null;
        user.refreshToken = null;
        await user.save();
    }
    async getCurrentUser(userId) {
        const user = await this.userModel.findById(userId).select('-password -refreshToken');
        if (!user || !user.isActive || user.deletedAt) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            user: user,
            navigation: this.navigationService.getAuthNavigation('login', user)
        };
    }
    async generateTokens(userId) {
        const payload = { sub: userId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('ACCESS_TOKEN_SECRET'),
                expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRY') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('REFRESH_TOKEN_SECRET'),
                expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRY') || '7d',
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_storage_config_schema_1.UserStorageConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        navigation_service_1.NavigationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map