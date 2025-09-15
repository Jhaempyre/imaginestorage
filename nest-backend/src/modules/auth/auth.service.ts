import { BadRequestException, ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NavigationService } from '../../common/services/navigation.service';
import { UserStorageConfig, UserStorageConfigDocument } from '../../schemas/user-storage-config.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AppException } from '@/common/dto/app-exception';
import { ERROR_CODES } from '@/common/constants/error-code.constansts';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserStorageConfig.name) private storageConfigModel: Model<UserStorageConfigDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private navigationService: NavigationService,
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

    await user.save();

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return {
      user: userResponse,
      navigation: this.navigationService.getAuthNavigation('register')
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
      });
    }

    user.lastLoginAt = new Date();

    const tokens = await this.generateTokens(user._id);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return {
      user: userResponse,
      tokens,
      navigation: this.navigationService.getAuthNavigation('login')
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

  async verifyEmail(token: string): Promise<{ user: any; navigation: any }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    // Get navigation after email verification
    const navigation = this.navigationService.getAuthNavigation('verify-email');

    return {
      user: {
        isEmailVerified: true,
        isOnboardingComplete: user.isOnboardingComplete,
      },
      navigation,
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

  async getCurrentUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).select('-password -refreshToken');

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    return user;
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