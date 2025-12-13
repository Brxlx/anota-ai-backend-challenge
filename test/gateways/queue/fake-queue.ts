/* eslint-disable @typescript-eslint/require-await */
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
  ): Promise<{ MessageId: string; bodySent: string; result: boolean }> {
    const MessageId = `${queueName}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const msg: QueueMessage = { MessageId, body: message };

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    this.queues.get(queueName)!.push(msg);
    // await new Promise((res) => setTimeout(res, 500));

    console.log(msg);

    // Simula SNS/SQS: mensagem é "enviada" para a fila
    return { MessageId, bodySent: message, result: true };
  }

  async consume(queueName: string): Promise<string> {
    const queue = this.queues.get(queueName);
    if (!queue || queue.length === 0) {
      // Simula fila vazia
      return '';
    }
    const msg = queue.shift();
    // Simula consumo (SQS: remove da fila)
    console.log('msg consumida ->', msg);
    return msg ? msg.body : '';
  }
}
