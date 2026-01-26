import { Prisma, PrismaClient } from '@generated/prisma/client';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { prefixedLogger } from '@/infra/helpers/prefixed-logger';
import { EnvService } from '@/infra/shared/env/env.service';

@Injectable()
export class PrismaService
  extends PrismaClient<
    {
      log: [
        { emit: 'event'; level: 'query' },
        { emit: 'event'; level: 'info' },
        { emit: 'event'; level: 'warn' },
        { emit: 'event'; level: 'error' },
      ];
      errorFormat: 'pretty';
    },
    Prisma.LogLevel
  >
  implements OnModuleInit, OnModuleDestroy
{
  private logger: Logger;

  constructor(private readonly envService: EnvService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
      errorFormat: 'pretty',
    });

    this.logger = prefixedLogger(this.envService.get('NODE_ENV'))!;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$runCommandRaw({ ping: 1 });
      this.logger.log('Connected to the database successfully');
    } catch (err) {
      this.logger.error('Error connecting to the database', err);
      process.exit(1);
    }

    // Não logar queries em produção
    if (this.envService.get('NODE_ENV') === 'prod') return;

    this.$on('query', (event) => {
      const magenta = '\u001b[35m';
      this.logger.log(
        `Query: ${magenta} ${event.query}`,
        `Params: ${magenta} ${event.query}`,
        `Duration: ${magenta} ${event.duration} ms`,
        '---------------------------------',
      );
    });

    this.$on('info', (event) => {
      this.logger.log(`INFO: ${event.message}`);
    });

    this.$on('warn', (event) => {
      this.logger.log(`WARN: ${event.message}`);
    });

    this.$on('error', (event) => {
      this.logger.log(`ERROR: ${event.message}`);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
