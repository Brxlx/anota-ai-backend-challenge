import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { Queue } from '@/domain/application/shared/gateways/queue.gateway';

import { EnvService } from '../../env/env.service';

@Injectable()
export class QueueConsumerService implements OnModuleInit {
  private readonly logger = new Logger(QueueConsumerService.name);
  private isConsuming = false;

  constructor(
    private readonly queueService: Queue,
    private readonly envService: EnvService,
  ) {}

  onModuleInit() {
    this.isConsuming = true;
    void this.startConsuming();
  }

  private async startConsuming() {
    const queueUrl = this.envService.get('AWS_QUEUE_TOPIC');
    while (this.isConsuming) {
      const result = await this.queueService.consume(queueUrl);
      if (result.isRight()) {
        const message = result.value;
        this.logger.log(`Mensagem consumida: ${message}`);
        // Aqui você pode processar a mensagem conforme necessário
      }
      // Pequeno delay para evitar loop muito agressivo
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
