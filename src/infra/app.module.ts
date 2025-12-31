import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GlobalHttpExceptionFilter } from './http/filters/global-http-exception.filter';
import { HttpModule } from './http/http.module';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
  ],
})
export class AppModule {}
