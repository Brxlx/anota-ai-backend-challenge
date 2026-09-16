import {
  CreateQueueCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { ConsumingFromQueueError } from '@/domain/application/Product/errors/consuming-from-queue.error';
import { SendToQueueError } from '@/domain/application/Product/errors/send-to-queue.error';
import { Queue } from '@/domain/application/shared/gateways/queue.gateway';

import { EnvService } from '../../env/env.service';

@Injectable()
export class AwsSqsQueueService implements Queue {
  private readonly sqs: SQSClient;
  private readonly failedQueueCache = new Set<string>();

  constructor(private readonly envService: EnvService) {
    this.sqs = new SQSClient({
      region: this.envService.get('AWS_REGION'),
      endpoint: this.envService.get('AWS_SQS_ENDPOINT'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async produce(
    queueUrl: string,
    message: string,
  ): Promise<Either<SendToQueueError, { MessageId: string; bodySent: string; result: boolean }>> {
    try {
      const ensuredQueueUrl = await this.ensureQueueExists(queueUrl);
      if (!ensuredQueueUrl) {
        return left(new SendToQueueError());
      }
      const command = new SendMessageCommand({
        QueueUrl: ensuredQueueUrl,
        MessageBody: message,
      });
      const response = await this.sqs.send(command);

      return right({
        MessageId: response.MessageId || '',
        bodySent: message,
        result: true,
      });
    } catch (_err) {
      return left(new SendToQueueError());
    }
  }

  /**
   * Garante que a fila existe, criando-a se necessário. Retorna a URL da fila.
   */
  private async ensureQueueExists(queueUrlOrName: string): Promise<string | null> {
    const maxAttempts = 5;
    let queueName = queueUrlOrName;

    if (queueUrlOrName.startsWith('http')) {
      const parts = queueUrlOrName.split('/');
      queueName = parts[parts.length - 1];
    }

    if (this.failedQueueCache.has(queueName)) {
      return null;
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const getQueueUrlRes = await this.sqs.send(new GetQueueUrlCommand({ QueueName: queueName }));
        this.failedQueueCache.delete(queueName);
        return getQueueUrlRes.QueueUrl || null;
      } catch {
        try {
          const createQueueRes = await this.sqs.send(new CreateQueueCommand({ QueueName: queueName }));
          this.failedQueueCache.delete(queueName);
          return createQueueRes.QueueUrl || null;
        } catch {
          if (attempt >= maxAttempts) {
            this.failedQueueCache.add(queueName);
            console.error(`Failed to create or get queue after ${maxAttempts} attempts: ${queueName}`);
            return null;
          }

          const backoffMs = Math.min(100 * 2 ** (attempt - 1), 1000);
          await this.wait(backoffMs);
        }
      }
    }

    return null;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async consume(queueUrl: string): Promise<Either<ConsumingFromQueueError, string>> {
    try {
      const ensuredQueueUrl = await this.ensureQueueExists(queueUrl);
      if (!ensuredQueueUrl) {
        return left(new ConsumingFromQueueError());
      }
      const command = new ReceiveMessageCommand({
        QueueUrl: ensuredQueueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 5,
      });
      const response = await this.sqs.send(command);
      const message = response.Messages?.[0];
      if (!message || !message.ReceiptHandle) {
        return left(new ConsumingFromQueueError());
      }
      // Deleta a mensagem após consumir
      await this.sqs.send(
        new DeleteMessageCommand({
          QueueUrl: ensuredQueueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
      console.log(`Li a mensagem: ${message.Body}`);
      return right(message.Body || '');
    } catch {
      return left(new ConsumingFromQueueError());
    }
  }
}
