import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AppException } from '@/common/dto/app-exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'emailOrUsername',
      passwordField: 'password',
    });
  }

  async validate(emailOrUsername: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(emailOrUsername, password);
    if (!user) {
      throw new AppException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'INVALID_CREDENTIALS',
        message: 'Auth.login.invalidCredentials',
        userMessage: 'Invalid credentials',
      })
    }
    return user;
  }
}