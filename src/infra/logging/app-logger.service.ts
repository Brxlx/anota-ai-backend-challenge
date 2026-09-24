import { Injectable, Logger, LoggerService } from '@nestjs/common';

import { prefixedLogger } from '@/infra/helpers/prefixed-logger';

export type MonitorErrorPayload = {
  name?: string;
  message: string;
  stack?: string;
  statusCode?: number;
  context?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AppLogger extends Logger implements LoggerService {
  private readonly appPrefix = 'APP';

  public logError(error: unknown, context = 'Application') {
    const payload = this.normalizeError(error, context);
    const logger = prefixedLogger(this.appPrefix, context);

    logger.error(this.formatErrorMessage(payload), payload.stack, context);
  }

  public logException(error: unknown, context = 'Application') {
    this.logError(error, context);
  }

  public logWarning(message: string, context = 'Application', metadata?: Record<string, unknown>) {
    const logger = prefixedLogger(this.appPrefix, context);
    logger.warn(this.formatWarningMessage(message, context, metadata), context);
  }

  private formatErrorMessage(payload: MonitorErrorPayload): string {
    const metadata = payload.metadata ? JSON.stringify(payload.metadata) : undefined;
    const statusCode = payload.statusCode !== undefined ? ` | statusCode=${payload.statusCode}` : '';

    return [
      `name=${payload.name ?? 'UnknownError'}`,
      `message=${payload.message}`,
      statusCode,
      metadata ? ` | metadata=${metadata}` : '',
    ]
      .join('')
      .trim();
  }

  private formatWarningMessage(message: string, context: string, metadata?: Record<string, unknown>): string {
    const serializedMetadata = metadata ? JSON.stringify(metadata) : undefined;

    return serializedMetadata
      ? `context=${context} | message=${message} | metadata=${serializedMetadata}`
      : `context=${context} | message=${message}`;
  }

  private normalizeError(error: unknown, context: string): MonitorErrorPayload {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
      };
    }

    if (typeof error === 'string') {
      return {
        name: 'UnknownError',
        message: error,
        context,
      };
    }

    if (error && typeof error === 'object') {
      const record = error as Record<string, unknown>;

      return {
        name: typeof record.name === 'string' ? record.name : 'UnknownError',
        message: typeof record.message === 'string' ? record.message : 'Unexpected error',
        context,
        metadata:
          typeof record.metadata === 'object' && record.metadata !== null
            ? (record.metadata as Record<string, unknown>)
            : undefined,
        stack: typeof record.stack === 'string' ? record.stack : undefined,
        statusCode: typeof record.statusCode === 'number' ? record.statusCode : undefined,
      };
    }

    return {
      name: 'UnknownError',
      message: 'Unexpected error',
      context,
    };
  }
}
