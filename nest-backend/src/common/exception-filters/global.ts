import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ERROR_CODES } from '../constants/error-code.constansts';
import { ApiResponseDto } from '../dto/api-response.dto';
import { AppException } from '../dto/app-exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppException) {
      const apiResponse = ApiResponseDto.fromException(exception);
      return response.status(exception.statusCode).json(apiResponse);
    }

    console.log({ exception });

    if (exception instanceof BadRequestException) {
      type ValidationErrorResponseBody = string | { message?: any; error?: any; statusCode?: number };
      const responseBody = exception.getResponse() as ValidationErrorResponseBody;

      console.log(responseBody, exception);

      const validationErrors = typeof responseBody === 'string'
        ? responseBody
        : typeof responseBody.message === 'string'
          ? responseBody.message
          : Array.isArray(responseBody.message)
            ? responseBody.message.join(', ')
            : typeof responseBody.error === 'string'
              ? Array.isArray(responseBody.error)
                ? responseBody.error.join(', ')
                : responseBody.error
              : '';

      const apiResponse = ApiResponseDto.error({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
        errorCode: ERROR_CODES.BAD_REQUEST,
        errorUserMessage: `Invalid input: ${validationErrors}` as any,
      });

      return response.status(HttpStatus.BAD_REQUEST).json(apiResponse);
    }


    // TODO: support more error types:


    // Handle unknown errors safely
    const apiResponse = ApiResponseDto.fromException(
      new AppException({
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected server error",
        userMessage: "Something went wrong. Please try again later.",
      })
    );
    return response.status(500).json(apiResponse);
  }
}
