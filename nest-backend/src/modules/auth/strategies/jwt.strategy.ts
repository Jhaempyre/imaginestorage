import { HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/schemas/user.schema';
import { AppException } from '@/common/dto/app-exception';
import { ERROR_CODES } from '@/common/constants/error-code.constansts';
import { FRONTEND_ROUTES } from '@/common/constants/routes.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name);
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => {
          console.log({ requestCookies: request?.cookies?.accessToken });
          return request?.cookies?.accessToken
        }, // cookie
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any): Promise<UserDocument> {
    const { sub: userId } = payload;

    const user = await this.userModel.findById(userId).select('-password -refreshToken');

    if (!user || !user.isActive || user.deletedAt) {
      this.logger.debug('User not found or inactive');
      throw new AppException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Auth.login.invalidCredentials',
        userMessage: 'Invalid credentials',
        details: 'Please check your credentials and try again.',
        navigation: {
          route: FRONTEND_ROUTES.AUTH.LOGIN,
          type: 'replace',
        }
      });
    }

    return user;
  }
}