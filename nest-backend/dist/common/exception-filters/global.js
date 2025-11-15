"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const api_response_dto_1 = require("../dto/api-response.dto");
const app_exception_1 = require("../dto/app-exception");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception instanceof app_exception_1.AppException) {
            const apiResponse = api_response_dto_1.ApiResponseDto.fromException(exception);
            return response.status(exception.statusCode).json(apiResponse);
        }
        const apiResponse = api_response_dto_1.ApiResponseDto.fromException(new app_exception_1.AppException({
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected server error",
            userMessage: "Something went wrong. Please try again later.",
        }));
        return response.status(500).json(apiResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global.js.map