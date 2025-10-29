import { User } from '@/schemas/user.schema';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    console.log("Email verified gurad: ", { user });

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email not verified');
    }

    return true;
  }
}
