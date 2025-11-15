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
exports.OnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const onboarding_service_1 = require("./onboarding.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const choose_provider_dto_1 = require("./dto/choose-provider.dto");
const configure_credentials_dto_1 = require("./dto/configure-credentials.dto");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const email_verified_guard_1 = require("../../common/guards/email-verified.guard");
const error_code_constansts_1 = require("../../common/constants/error-code.constansts");
const app_exception_1 = require("../../common/dto/app-exception");
let OnboardingController = class OnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async getOnboardingStatus(request) {
        const userId = request.user['_id'];
        const data = await this.onboardingService.getOnboardingStatus(userId);
        return api_response_dto_1.ApiResponseDto.success({
            data,
            message: 'Onboarding.getOnboardingStatus.success',
        });
    }
    async chooseProvider(chooseProviderDto, request) {
        const userId = request.user['_id'];
        const data = await this.onboardingService.chooseProvider(userId, chooseProviderDto);
        return api_response_dto_1.ApiResponseDto.success({
            data,
            message: 'Onboarding.chooseProvider.success',
            navigation: data.navigation,
        });
    }
    async configureCredentials(configureCredentialsDto, request) {
        const userId = request.user['_id'];
        const result = await this.onboardingService.configureCredentials(userId, configureCredentialsDto);
        if (result.success) {
            return api_response_dto_1.ApiResponseDto.success({
                data: result,
                navigation: result.navigation,
                message: 'Onboarding.configureCredentials.success',
            });
        }
        else {
            throw new app_exception_1.AppException({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                code: error_code_constansts_1.ERROR_CODES.INVALID_CREDENTIALS,
                message: 'Onboarding.configureCredentials.invalidCredentials',
                userMessage: 'Invalid credentials',
                navigation: result.navigation,
            });
        }
    }
};
exports.OnboardingController = OnboardingController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get onboarding status',
        description: 'Retrieve the current onboarding status and next steps for the user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding status retrieved successfully',
        type: api_response_dto_1.ApiResponseDto
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('choose-provider'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Choose storage provider (Step 1)',
        description: 'Select a storage provider for the user account'
    }),
    (0, swagger_1.ApiBody)({ type: choose_provider_dto_1.ChooseProviderDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Storage provider selected successfully',
        type: api_response_dto_1.ApiResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid provider or validation error'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [choose_provider_dto_1.ChooseProviderDto, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "chooseProvider", null);
__decorate([
    (0, common_1.Post)('configure-credentials'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Configure storage credentials (Step 2)',
        description: 'Configure and validate storage provider credentials'
    }),
    (0, swagger_1.ApiBody)({ type: configure_credentials_dto_1.ConfigureCredentialsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Storage credentials configured and validated successfully',
        type: api_response_dto_1.ApiResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid credentials or validation failed'
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [configure_credentials_dto_1.ConfigureCredentialsDto, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "configureCredentials", null);
exports.OnboardingController = OnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Onboarding'),
    (0, common_1.Controller)('onboarding'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, email_verified_guard_1.EmailVerifiedGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], OnboardingController);
//# sourceMappingURL=onboarding.controller.js.map