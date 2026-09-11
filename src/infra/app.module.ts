import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GlobalHttpExceptionFilter } from './http/filters/global-http-exception.filter';
import { UseCaseErrorFilter } from './http/filters/use-case-error.filter';
import { HttpModule } from './http/http.module';

@Module({
  imports: [HttpModule],
  providers: [
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
