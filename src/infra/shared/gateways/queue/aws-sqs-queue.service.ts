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
    // Se for uma URL, extrai o nome da fila
    let queueName = queueUrlOrName;
    if (queueUrlOrName.startsWith('http')) {
      const parts = queueUrlOrName.split('/');
      queueName = parts[parts.length - 1];
    }
    try {
      // Tenta obter a URL da fila
      const getQueueUrlCmd = new GetQueueUrlCommand({ QueueName: queueName });
      const getQueueUrlRes = await this.sqs.send(getQueueUrlCmd);
      return getQueueUrlRes.QueueUrl || null;
    } catch {
      // Se não existir, cria
      try {
        const createQueueCmd = new CreateQueueCommand({ QueueName: queueName });
        const createQueueRes = await this.sqs.send(createQueueCmd);
        return createQueueRes.QueueUrl || null;
      } catch {
        return null;
      }
    }
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
