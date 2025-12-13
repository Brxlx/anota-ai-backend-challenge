import { Either } from '@/core/types/either';

import { ConsumingFromQueueError } from '../../Product/errors/consuming-from-queue.error';
import { SendToQueueError } from '../../Product/errors/send-to-queue.error';

export abstract class Queue {
  abstract produce(
    queueName: string,
    message: string,
  ): Promise<Either<SendToQueueError, { MessageId: string; bodySent: string; result: boolean }>>;
  abstract consume(queueName: string): Promise<Either<ConsumingFromQueueError, string>>;
}
