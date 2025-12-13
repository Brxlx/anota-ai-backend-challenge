export abstract class Queue {
  abstract produce(
    queueName: string,
    message: string,
  ): Promise<{ MessageId: string; bodySent: string; result: boolean }>;
  abstract consume(queueName: string): Promise<string>;
}
