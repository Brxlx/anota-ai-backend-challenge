import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { CategoryAlreadyExistsError } from '@/domain/application/Category/errors/category-already-exists.error';
import { InvalidCategoryIdError } from '@/domain/application/Category/errors/invalid-category-id.error';
import { InvalidCategoryOwnerIdError } from '@/domain/application/Category/errors/invalid-category-owner-id.error';
import { ConsumingFromQueueError } from '@/domain/application/Product/errors/consuming-from-queue.error';
import { InvalidProductIdError } from '@/domain/application/Product/errors/invalid-product-id.error';
import { InvalidProductOwnerIdError } from '@/domain/application/Product/errors/invalid-product-owner-id.error';
import { ProductAlreadyExistsError } from '@/domain/application/Product/errors/product-already-exists.error';
import { SendToQueueError } from '@/domain/application/Product/errors/send-to-queue.error';
import { SendToStorageError } from '@/domain/application/Product/errors/send-to-storage.error';
import { NegativeAmountError } from '@/domain/enterprise/entities/value-objects/errors/negtive-amount.error';

// Interface para representar a estrutura da resposta do NestJS para exceções HTTP
interface NestHttpExceptionResponse {
  message: string | string[];
  errors?: Record<string, string[]>;
}

// Interface para representar a estrutura da resposta de erro HTTP
interface HttpErrorResponse {
  statusCode: number;
  message: string | string[];
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Definindo o tipo ResponseExtractor para aceitar unknown
type ResponseExtractor = (response: unknown) => NestHttpExceptionResponse;

@Catch(Error)
export class UseCaseErrorFilter implements ExceptionFilter {
  private mapErroToStatusCode = new Map<string, HttpStatus>([
    [CategoryAlreadyExistsError.name, HttpStatus.BAD_REQUEST],
    [InvalidCategoryIdError.name, HttpStatus.BAD_REQUEST],
    [InvalidCategoryOwnerIdError.name, HttpStatus.BAD_REQUEST],
    [ConsumingFromQueueError.name, HttpStatus.GATEWAY_TIMEOUT],
    [InvalidProductIdError.name, HttpStatus.BAD_REQUEST],
    [InvalidProductOwnerIdError.name, HttpStatus.BAD_REQUEST],
    [ProductAlreadyExistsError.name, HttpStatus.BAD_REQUEST],
    [SendToQueueError.name, HttpStatus.SERVICE_UNAVAILABLE],
    [SendToStorageError.name, HttpStatus.SERVICE_UNAVAILABLE],
    [NegativeAmountError.name, HttpStatus.BAD_REQUEST],
  ]);

  // Estratégias de extração baseadas no tipo de resposta
  private extractors: Record<string, ResponseExtractor> = {
    string: (response: unknown): NestHttpExceptionResponse => ({
      message: response as string,
      errors: undefined,
    }),
    object: (response: unknown): NestHttpExceptionResponse => {
      const objResponse = response as Record<string, any>;
      return {
        message: (objResponse?.message as string | string[] | undefined) ?? 'Something went wrong on Server',
        errors:
          objResponse?.errors && typeof objResponse.errors === 'object'
            ? (objResponse.errors as Record<string, string[]>)
            : undefined,
      };
    },
    default: (_: unknown): NestHttpExceptionResponse => ({
      message: 'Something went wrong on Server',
      errors: undefined,
    }),
  };

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (error instanceof HttpException) {
      const errorResponse = error.getResponse();
      const { message, errors } = this.extractErrorDetails(errorResponse);

      const httpErrorResponse: HttpErrorResponse = {
        statusCode: error.getStatus(),
        message,
        errors,
        timestamp: new Date().toISOString(),
      };

      return response.status(error.getStatus()).send(httpErrorResponse);
    }

    // It's Use Case Error
    // console.log(
    //   'Value of status from mapToError: ',
    //   this.mapErroToStatusCode.get(error.constructor.name),
    // );
    const statusCode =
      this.mapErroToStatusCode.get(error.constructor.name) ?? HttpStatus.INTERNAL_SERVER_ERROR;

    return response.status(statusCode).send({
      statusCode,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Extracts message and errors from the error response
   * @param errorResponse The response from HttpException.getResponse()
   * @returns An object containing message and errors
   */
  private extractErrorDetails(errorResponse: unknown): NestHttpExceptionResponse {
    // Mapeamento de tipo para chave do extractor
    const typeToKey: Record<string, string> = {
      string: 'string',
      object: 'object',
    };

    // Determina a chave do extractor baseado no tipo do errorResponse
    const extractorKey = errorResponse !== null ? typeToKey[typeof errorResponse] || 'default' : 'default';

    // Obtém o extractor apropriado e aplica ao errorResponse
    return this.extractors[extractorKey](errorResponse);
  }
}
