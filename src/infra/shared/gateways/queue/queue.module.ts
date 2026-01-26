import { Module } from '@nestjs/common';

import { Queue } from '@/domain/application/shared/gateways/queue.gateway';

import { EnvModule } from '../../env/env.module';
import { AwsSqsQueueService } from './aws-sqs-queue.service';
import { QueueConsumerService } from './queue-consumer.service';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Queue,
      useClass: AwsSqsQueueService,
    },
    QueueConsumerService,
  ],
  exports: [Queue, QueueConsumerService],
})
export class QueueModule {}
