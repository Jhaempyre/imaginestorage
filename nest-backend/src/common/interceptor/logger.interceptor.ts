import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { catchError, Observable, tap, throwError } from "rxjs";
import { AppLogger } from "@/common/utils/logger";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<any>();
    const response = ctx.getResponse<any>();
    const { method, originalUrl, params, query, body, headers, cookies } = request;

    const start = Date.now();

    // Log incoming request with headers and cookies
    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} | Params: ${JSON.stringify(params)} | Query: ${JSON.stringify(query)} | Body: ${JSON.stringify(body)} | Headers: ${JSON.stringify(headers)}`,
      "HTTP",
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const status = response.statusCode;
        const message = `Outgoing Response: ${method} ${originalUrl} | ${status} | ${duration}ms`;
        if (status >= 500) this.logger.error(message, JSON.stringify(response), "HTTP");
        else if (status >= 400) this.logger.warn(message, JSON.stringify(response), "HTTP");
        else this.logger.log(message, "HTTP");
      }),
      catchError((err) => {
        const duration = Date.now() - start;
        const status = err.status || 500;
        const msg = `Exception Response: ${method} ${originalUrl} | ${status} | ${duration}ms | ${err.message}`;
        if (status >= 500) this.logger.error(msg, err.stack, "HTTP");
        else if (status >= 400) this.logger.warn(msg, err.stack, "HTTP");
        return throwError(() => err);
      }),
    );
  }
}
