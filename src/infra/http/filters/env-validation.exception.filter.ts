import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common';
import { Response } from 'express';

import { AppLogger } from '@/infra/logging/app-logger.service';
import { EnvValidationError } from '@/infra/shared/env/env.schema';

/**
 * Exception filter that handles EnvValidationError
 * Parses the validation error message and formats it into a structured response
 */
@Catch(EnvValidationError)
export class EnvValidationExceptionFilter implements ExceptionFilter {
  constructor(@Inject(AppLogger) private readonly logger: AppLogger) {}

  /**
   * Extracts structured errors from EnvValidationError
   */
  private extractValidationErrors(exception: EnvValidationError): Record<string, string> {
    if (exception.errors && Object.keys(exception.errors).length > 0) {
      return exception.errors;
    }

    // Fallback: parse from message if errors property is empty
    const errors: Record<string, string> = {};
    const lines = exception.message.split('\n').slice(1); // Skip header

    for (const line of lines) {
      const match = line.match(/•\s*(\w+):\s*(.+)/);
      if (match) {
        errors[match[1]] = match[2];
      }
    }

    return errors;
  }

  catch(exception: EnvValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const parsedErrors = this.extractValidationErrors(exception);

    const httpErrorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid environment variables configuration',
      errors: parsedErrors,
      timestamp: new Date().toISOString(),
    };

    this.logger.logError(
      {
        name: 'EnvValidationError',
        message: exception.message,
        statusCode: HttpStatus.BAD_REQUEST,
        metadata: { errors: parsedErrors },
        stack: exception?.stack,
      },
      EnvValidationExceptionFilter.name,
    );

    return response.status(HttpStatus.BAD_REQUEST).send(httpErrorResponse);
  }
}
