import { BadRequestException, ConflictException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NavigationService } from '../../common/services/navigation.service';
import { UserStorageConfig, UserStorageConfigDocument } from '../../schemas/user-storage-config.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AppException } from '@/common/dto/app-exception';
import { ERROR_CODES } from '@/common/constants/error-code.constansts';
import { FRONTEND_ROUTES, NAVIGATION_TYPES } from '@/common/constants/routes.constants';
import { NavigationControl } from '@/common/interfaces/navigation.interface';
import { EmailService } from '../email/email.service';
import { EnvironmentVariables } from '@/common/utils/validate-env';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserStorageConfig.name) private storageConfigModel: Model<UserStorageConfigDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private navigationService: NavigationService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto): Promise<{ user: any; navigation: any }> {
    const { email, username, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppException({
          code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
          message: 'Auth.register.emailAlreadyExists',
          userMessage: 'Email already exists',
          details: 'Please use a different email address.',
          statusCode: HttpStatus.CONFLICT,
        });
      }
      if (existingUser.username === username) {
        throw new AppException({
          code: ERROR_CODES.USERNAME_ALREADY_EXISTS,
          message: 'Auth.register.usernameAlreadyExists',
          userMessage: 'Username already exists',
          details: 'Please use a different username.',
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    // Create new user
    const user = new this.userModel({
      firstName,
      lastName,
      email,
      username,
      password,
    });

    // Generate email verification token
    user.generateEmailVerificationToken();
    await user.save();

    this.logger.debug(`Mock email sent to ${user.email}, token: ${user.emailVerificationToken}`);
    const url = new URL(`${this.configService.get<EnvironmentVariables>('FRONTEND_BASE_URL')}${FRONTEND_ROUTES.AUTH.VERIFY_EMAIL}/${user.emailVerificationToken}`);
    this.emailService.sendVerificationEmail(user.email, url.toString(), user.firstName);

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return {
      user: userResponse,
      navigation: this.navigationService.getAuthNavigation('register', user)
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: any; tokens: any; navigation: any }> {
    const user = await this.validateUser(loginDto.emailOrUsername, loginDto.password);
    console.log({ user, api: 'login' });
    if (!user) {
      throw new AppException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Auth.login.invalidCredentials',
        userMessage: 'Invalid credentials',
      });
    }

    if (!user.isEmailVerified) {
      throw new AppException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.EMAIL_NOT_VERIFIED,
        message: 'Auth.login.emailNotVerified',
        userMessage: 'Email not verified',
        navigation: {
          route: `${FRONTEND_ROUTES.AUTH.VERIFY_EMAIL}/e/${user.email}`,
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

    // const existingConfig = await this.storageConfigModel.findOne({
    //   userId: new Types.ObjectId(userResponse._id),
    //   isActive: true
    // });

    return {
      user: userResponse,
      tokens,
      navigation: this.navigationService.getAuthNavigation('login', user)
    };
  }

  async validateUser(emailOrUsername: string, password: string): Promise<UserDocument | null> {
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

  async refreshTokens(refreshToken: string): Promise<{ tokens: any }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.userModel.findById(payload.sub);

      if (!user || !user.isActive || user.deletedAt || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user._id);

      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return { tokens };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();
  }

  async getEmailVerificationStatus(email: string): Promise<{
    isEmailVerified: boolean;
    isTokenExpired: boolean,
    expirationTime: string;
    resendCooldown: number;
    navigation: NavigationControl | null;
  }> {
    let user = await this.userModel.findOne({ email }).select('+isEmailVerified');
    if (!user) {
      throw new AppException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.NOT_FOUND,
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
        type: NAVIGATION_TYPES.PUSH
      } : null
    };
  }

  async verifyEmail(token: string): Promise<{ user: any; navigation: any }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      // emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new AppException({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Auth.verifyEmail.invalidToken',
        userMessage: 'Invalid verification token',
        details: 'Please try requesting a new verification email.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    console.log({ expiry: user.emailVerificationExpiry, now: new Date() });

    if (user.emailVerificationExpiry < new Date()) {
      throw new AppException({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Auth.verifyEmail.expiredToken',
        userMessage: 'Verification token has expired',
        details: 'Please request a new verification email.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    // Get navigation after email verification
    // const navigation = this.navigationService.getAuthNavigation('verify-email');

    return {
      user: {
        isEmailVerified: true,
        isOnboardingComplete: user.isOnboardingComplete,
      },
      navigation: null,
    };
  }

  async resendEmailVerification(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    user.generateEmailVerificationToken();
    await user.save();


    // TODO: Send email verification email
    // await this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
    const url = new URL(`${this.configService.get<EnvironmentVariables>('FRONTEND_BASE_URL')}${FRONTEND_ROUTES.AUTH.VERIFY_EMAIL}/${user.emailVerificationToken}`);
    this.logger.debug(`Mock email sent to ${user.email}, token: ${url.toString()}`);
    this.emailService.sendVerificationEmail(user.email, url.toString(), user.firstName);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    user.generatePasswordResetToken();
    await user.save();

    // TODO: Send password reset email
    // await this.emailService.sendPasswordResetEmail(user.email, user.passwordResetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();
  }

  async getCurrentUser(userId: string): Promise<{ user: UserDocument, navigation: NavigationControl }> {
    const user = await this.userModel.findById(userId).select('-password -refreshToken');

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    // const existingConfig = await this.storageConfigModel.findOne({
    //   userId: new Types.ObjectId(userId),
    //   isActive: true
    // });

    return {
      user: user,
      navigation: this.navigationService.getAuthNavigation('login', user)
    };
  }

  private async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}