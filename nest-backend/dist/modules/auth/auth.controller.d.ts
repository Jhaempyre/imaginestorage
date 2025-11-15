import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendEmailVerificationDto } from './dto/resend-verification-token.dto';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { VerificationStatusResponseDto } from './dto/verification-status-response.dto';
export declare class AuthController {
    private readonly authService;
    private logger;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, response: Response): Promise<ApiResponseDto<{
        user: any;
        navigation: any;
    }>>;
    login(loginDto: LoginDto, request: Request, response: Response): Promise<ApiResponseDto<{
        user: any;
        accessToken: any;
    }>>;
    refreshToken(request: Request, response: Response): Promise<ApiResponseDto<{
        accessToken: any;
    }>>;
    logout(request: Request, response: Response): Promise<ApiResponseDto<any>>;
    getCurrentUser(request: Request): Promise<ApiResponseDto<{
        user: import("../../schemas/user.schema").UserDocument;
    }>>;
    changePassword(changePasswordDto: ChangePasswordDto, request: Request, response: Response): Promise<ApiResponseDto<any>>;
    getEmailVerificationStatus(email: string): Promise<ApiResponseDto<VerificationStatusResponseDto>>;
    verifyEmail(dto: VerifyEmailDto): Promise<ApiResponseDto<any>>;
    resendEmailVerification(dto: ResendEmailVerificationDto): Promise<ApiResponseDto<any>>;
    forgotPassword(email: string): Promise<ApiResponseDto<any>>;
    resetPassword(token: string, newPassword: string): Promise<ApiResponseDto<any>>;
}
