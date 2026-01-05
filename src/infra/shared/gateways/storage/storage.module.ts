import { Module } from '@nestjs/common';

import { Storage } from '@/domain/application/shared/gateways/storage.gateway';

import { EnvModule } from '../../env/env.module';
import { AwsS3StorageService } from './aws-s3-storage.service';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Storage,
      useClass: AwsS3StorageService,
    },
  ],
  exports: [Storage],
})
export class StorageModule {}
