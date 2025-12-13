/* eslint-disable @typescript-eslint/require-await */
import { Either, left, right } from '@/core/types/either';
import { ConsumingFromQueueError } from '@/domain/application/Product/errors/consuming-from-queue.error';
import { SendToQueueError } from '@/domain/application/Product/errors/send-to-queue.error';
import { Queue } from '@/domain/application/shared/gateways/queue.gateway';

type QueueMessage = {
  MessageId: string;
  body: string;
};

export class FakeQueue implements Queue {
  private queues: Map<string, QueueMessage[]> = new Map();

  async produce(
    queueName: string,
    message: string,
  ): Promise<Either<Error, { MessageId: string; bodySent: string; result: boolean }>> {
    try {
      const MessageId = `${queueName}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const msg: QueueMessage = { MessageId, body: message };

      if (!this.queues.has(queueName)) {
        this.queues.set(queueName, []);
      }
      this.queues.get(queueName)!.push(msg);
      // await new Promise((res) => setTimeout(res, 500));

      // Simula SNS/SQS: mensagem é "enviada" para a fila
      return right({ MessageId, bodySent: message, result: true });
    } catch {
      return left(new SendToQueueError());
    }
  }

  async consume(queueName: string): Promise<Either<Error, string>> {
    try {
      const queue = this.queues.get(queueName);
      if (!queue || queue.length === 0) {
        // Simula fila vazia
        return right('');
      }
      const msg = queue.shift();
      // Simula consumo (SQS: remove da fila)
      console.log('msg consumida ->', msg);
      return right(msg ? msg.body : '');
    } catch {
      return left(new ConsumingFromQueueError());
    }
  }
}
