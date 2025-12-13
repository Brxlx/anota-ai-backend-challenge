import { QueueErrorMessagesConsts } from '@/core/consts/queue.consts';
import { UseCaseError } from '@/core/errors/use-case.error';

export class SendToQueueError extends Error implements UseCaseError {
  constructor() {
    super(QueueErrorMessagesConsts.SEND_TO_QUEUE_ERROR);
  }
}
