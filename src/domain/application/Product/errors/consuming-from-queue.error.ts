import { QueueErrorMessagesConsts } from '@/core/consts/queue.consts';
import { UseCaseError } from '@/core/errors/use-case.error';

export class ConsumingFromQueueError extends Error implements UseCaseError {
  constructor() {
    super(QueueErrorMessagesConsts.CONSUME_QUEUE_ERROR);
  }
}
