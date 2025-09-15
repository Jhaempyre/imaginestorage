import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendEmailVerificationDto } from './dto/resend-verification-token.dto';
import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { AppException } from '@/common/dto/app-exception';
import { ERROR_CODES } from '@/common/constants/error-code.constansts';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log("Registering user", registerDto);
    const result = await this.authService.register(registerDto);
    console.log("Registering user result", result);

    return ApiResponseDto.success({
      message: 'Auth.register.success',
      data: result,
      navigation: result.navigation,
    });
  }

  // @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log({ loginDto });
    const result = await this.authService.login(loginDto);

    // Set refresh token in httpOnly cookie
    response.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Set access token in cookie (optional)
    response.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes,
      path: '/',
    });

    return ApiResponseDto.success({
      message: 'Auth.login.success',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      navigation: result.navigation,
    });
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Auth.refreshToken.tokenNotFound',
        userMessage: 'Refresh token not found',
        details: 'Please log in again to continue.',
      });
    }

    const result = await this.authService.refreshTokens(refreshToken);

    // Set new refresh token in httpOnly cookie
    response.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set new access token in cookie
    response.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return ApiResponseDto.success({
      message: 'Auth.refreshToken.success',
      data: {
        accessToken: result.tokens.accessToken,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.user['_id']);

    // Clear cookies
    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');

    return ApiResponseDto.success({
      message: 'Auth.logout.success',
      data: null,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user retrieved successfully' })
  async getCurrentUser(@Req() request: Request) {
    const user = await this.authService.getCurrentUser(request.user['_id']);
    this.logger.log({ user });
    return ApiResponseDto.success({
      message: 'Auth.getCurrentUser.success',
      data: { user },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.changePassword(request.user['_id'], changePasswordDto);

    // Clear cookies to force re-login
    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');

    return ApiResponseDto.success({
      message: 'Auth.changePassword.success',
      data: null,
    });
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(dto.token);

    return ApiResponseDto.success({
      message: 'Auth.verifyEmail.success',
      data: result.user,
      navigation: result.navigation,
    });
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully' })
  async resendEmailVerification(@Body() dto: ResendEmailVerificationDto) {
    await this.authService.resendEmailVerification(dto.email);

    return ApiResponseDto.success({
      message: 'Auth.resendVerification.success',
      data: null,
    });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if email exists' })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);

    return ApiResponseDto.success({
      message: 'Auth.forgotPassword.success',
      data: null,
    });
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);

    return ApiResponseDto.success({
      message: 'Auth.resetPassword.success',
      data: null,
    });
  }
}