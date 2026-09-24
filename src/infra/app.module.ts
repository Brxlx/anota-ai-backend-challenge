import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { EnvValidationExceptionFilter } from './http/filters/env-validation.exception.filter';
import { GlobalHttpExceptionFilter } from './http/filters/global-http-exception.filter';
import { UseCaseErrorFilter } from './http/filters/use-case-error.filter';
import { HttpModule } from './http/http.module';
import { AppLogger } from './logging/app-logger.service';

@Module({
  imports: [HttpModule],
  providers: [
    AppLogger,
    {
      provide: APP_FILTER,
      useClass: EnvValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UseCaseErrorFilter,
    },
    // {
    //   provide: APP_PIPE,
    //   useClass: ZodValidationPipe,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ZodSerializerInterceptor,
    // },
  ],
})
export class AppModule {}
