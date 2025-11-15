import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class EmailVerifiedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
