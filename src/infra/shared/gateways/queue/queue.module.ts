import { Module } from '@nestjs/common';

import { Queue } from '@/domain/application/shared/gateways/queue.gateway';

import { EnvModule } from '../../env/env.module';
import { AwsSqsQueueService } from './aws-sqs-queue.service';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Queue,
      useClass: AwsSqsQueueService,
    },
  ],
  exports: [Queue],
})
export class QueueModule {}
