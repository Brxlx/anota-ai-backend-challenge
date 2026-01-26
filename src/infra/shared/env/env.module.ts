import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreEnv } from '@/domain/application/shared/env/env';

import { envSchema } from './env.schema';
import { EnvService } from './env.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config) => envSchema.parse(config),
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env'],
    }),
  ],
  providers: [{ provide: CoreEnv, useClass: EnvService }, EnvService],
  exports: [CoreEnv, EnvService],
})
export class EnvModule {}
