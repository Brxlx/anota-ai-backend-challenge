/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from '@nestjs/common';

import { AppLogger } from '@/infra/logging/app-logger.service';

/**
 * A global exception filter that handles HTTP exceptions and provides a consistent error response format.
 * This filter is used to catch and handle any `HttpException` that is thrown within the application.
 * It will extract the error message and any validation errors, and return a JSON response with a standardized format.
 */
@Catch(HttpException)
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(AppLogger) private readonly logger: AppLogger) {}

  /*
   * The error response is structured as follows:
   * - `statusCode`: The HTTP status code of the response.
   * - `message`: A human-readable message describing the error.
   * - `errors`: If the error is related to validation, this field will contain an array of validation errors.
   * - `timestamp`: The timestamp when the error occurred.
   * Important: IF uses fastify as provider, uses `.send()`method instead of `.json()`
   */
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    let errMessage = exception.response;
    let errors = undefined;

    if (
      typeof exception.response === 'object' &&
      exception.response.message === 'Error validating input fields'
    ) {
      errMessage = exception.response.message;
      errors = exception.response.errors;
    }

    this.logger.logError(
      {
        name: exception?.name ?? 'HttpException',
        message: typeof errMessage === 'string' ? errMessage : 'Unexpected HTTP error',
        statusCode: status,
        metadata: { errors, response: exception.response },
        stack: exception?.stack,
      },
      GlobalHttpExceptionFilter.name,
    );

    response.status(status).send({
      statusCode: status,
      message: errMessage || 'An unexpected error occurred.',
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
