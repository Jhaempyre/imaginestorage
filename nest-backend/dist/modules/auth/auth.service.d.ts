import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { NavigationService } from '../../common/services/navigation.service';
import { UserStorageConfigDocument } from '../../schemas/user-storage-config.schema';
import { UserDocument } from '../../schemas/user.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { NavigationControl } from '@/common/interfaces/navigation.interface';
export declare class AuthService {
    private userModel;
    private storageConfigModel;
    private jwtService;
    private configService;
    private navigationService;
    private logger;
    constructor(userModel: Model<UserDocument>, storageConfigModel: Model<UserStorageConfigDocument>, jwtService: JwtService, configService: ConfigService, navigationService: NavigationService);
    register(registerDto: RegisterDto): Promise<{
        user: any;
        navigation: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: any;
        tokens: any;
        navigation: any;
    }>;
    validateUser(emailOrUsername: string, password: string): Promise<UserDocument | null>;
    refreshTokens(refreshToken: string): Promise<{
        tokens: any;
    }>;
    logout(userId: string): Promise<void>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    getEmailVerificationStatus(email: string): Promise<{
        isEmailVerified: boolean;
        isTokenExpired: boolean;
        expirationTime: string;
        resendCooldown: number;
        navigation: NavigationControl | null;
    }>;
    verifyEmail(token: string): Promise<{
        user: any;
        navigation: any;
    }>;
    resendEmailVerification(email: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    getCurrentUser(userId: string): Promise<{
        user: UserDocument;
        navigation: NavigationControl;
    }>;
    private generateTokens;
}
