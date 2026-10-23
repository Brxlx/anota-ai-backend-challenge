import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { Queue } from '@/domain/application/shared/gateways/queue.gateway';

import { EnvService } from '../../env/env.service';

const BASE_DELAY_MS = 1000;
const MAX_BACKOFF_DELAY_MS = 30_000;
const MAX_BACKOFF_EXPONENT = 5;
const MAX_CONSECUTIVE_ERRORS = 5;

@Injectable()
export class QueueConsumerService implements OnModuleInit, OnModuleDestroy {
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

  onModuleDestroy() {
    this.isConsuming = false;
  }

  private async startConsuming() {
    try {
      const queueUrl = this.envService.get('AWS_QUEUE_TOPIC');
      let consecutiveErrors = 0;

      while (this.isConsuming) {
        try {
          const result = await this.queueService.consume(queueUrl);

          if (result.isRight()) {
            consecutiveErrors = 0;
            await this.handleMessage(result.value);
          } else {
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              this.logger.error(`Falha inesperada consumindo fila: ${result.value.message}`);
            } else {
              // `consume()` retorna `left` tanto para "fila vazia" (sem mensagens
              // após o long-polling) quanto para erros reais (fila inacessível,
              // credenciais inválidas, etc.) — o gateway atual não distingue os
              // dois casos, então o log fica em `debug` para não gerar ruído em
              // operação normal. O backoff abaixo é aplicado por segurança, caso
              // a causa seja um erro persistente.
              consecutiveErrors++;
              this.logger.debug(`Nenhuma mensagem consumida (falha consecutiva nº ${consecutiveErrors}).`);
            }
          }
        } catch (err) {
          consecutiveErrors++;

          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            this.logger.error(
              `Limite de ${MAX_CONSECUTIVE_ERRORS} erros consecutivos ao consumir da fila atingido. ` +
                `Encerrando o consumo. Último erro: ${(err as Error).message}`,
              (err as Error).stack,
            );
            this.isConsuming = false;
            break;
          }

          this.logger.error(
            // eslint-disable-next-line max-len
            `Erro ao consumir da fila (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}): ${(err as Error).message}`,
            (err as Error).stack,
          );
        }

        await this.wait(this.getDelay(consecutiveErrors));
      }

      this.logger.log('Consumo de fila encerrado.');
    } catch (err) {
      // Falha ao ler a configuração da fila ou qualquer outro erro fora do
      // loop principal: evita que a promise de onModuleInit rejeite sem
      // tratamento (unhandled rejection) e encerra o serviço de forma segura.
      this.isConsuming = false;
      this.logger.error(
        `Falha fatal ao iniciar o consumo da fila: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }

  /**
   * Processa uma mensagem consumida da fila.
   *
   * A mensagem já foi removida da fila (ack via DeleteMessage) pelo gateway
   * no momento em que `consume()` retornou com sucesso — portanto qualquer
   * falha aqui não deve derrubar o loop de consumo, apenas ser registrada.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleMessage(message: string): Promise<void> {
    try {
      this.logger.log(`Mensagem consumida: ${message}`);
      // TODO: implementar o processamento de negócio da mensagem.
    } catch (err) {
      this.logger.error(`Erro ao processar mensagem: ${(err as Error).message}`, (err as Error).stack);
    }
  }

  /**
   * Delay entre tentativas de consumo. Em operação normal (sem erros
   * consecutivos) usa o delay base; em caso de falhas repetidas, aplica
   * backoff exponencial limitado a `MAX_BACKOFF_DELAY_MS`.
   */
  private getDelay(consecutiveErrors: number): number {
    if (consecutiveErrors === 0) {
      return BASE_DELAY_MS;
    }
    const exponent = Math.min(consecutiveErrors, MAX_BACKOFF_EXPONENT);
    return Math.min(BASE_DELAY_MS * 2 ** exponent, MAX_BACKOFF_DELAY_MS);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
