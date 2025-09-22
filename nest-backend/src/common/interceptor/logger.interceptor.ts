import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppLogger } from '../utils/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, originalUrl, params, query, body } = request as any;

    const start = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} | Params: ${JSON.stringify(
        params,
      )} | Query: ${JSON.stringify(query)} | Body: ${JSON.stringify(body)}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap((response) => {
        const time = Date.now() - start;
        this.logger.log(
          `Outgoing Response: ${method} ${originalUrl} | ${time}ms | Response: ${JSON.stringify(
            response,
          )}`,
          'HTTP',
        );
      }),
    );
  }
}
