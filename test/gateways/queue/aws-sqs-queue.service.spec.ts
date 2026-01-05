import { Test, TestingModule } from '@nestjs/testing';

import { CoreEnv } from '@/domain/application/shared/env/env';
import { EnvModule } from '@/infra/shared/env/env.module';
import { Env } from '@/infra/shared/env/env.schema';
import { EnvService } from '@/infra/shared/env/env.service';
import { AwsSqsQueueService } from '@/infra/shared/gateways/queue/aws-sqs-queue.service';

describe('AwsSqsQueueService (integration)', () => {
  let service: AwsSqsQueueService;
  let envService: CoreEnv<Env>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnvModule],
      providers: [
        AwsSqsQueueService,
        {
          provide: EnvService,
          useValue: {
            get: (key: string) => {
              const env: Record<string, string> = {
                AWS_REGION: 'us-east-1',
                AWS_SQS_ENDPOINT: 'http://localhost:4566',
                AWS_ACCESS_KEY_ID: 'fake-access-key',
                AWS_SECRET_ACCESS_KEY: 'fake-secret-key',
              };
              return env[key];
            },
          },
        },
        {
          provide: 'CoreEnv',
          useExisting: EnvService,
        },
      ],
    }).compile();

    envService = module.get<CoreEnv<Env>>(EnvService);
    service = new AwsSqsQueueService(envService);
  });

  it('should produce and consume a message', async () => {
    const queueName = 'test-queue';
    const message = 'hello world';
    const produceResult = await service.produce(queueName, message);
    expect(produceResult.isRight()).toBe(true);
    const consumeResult = await service.consume(queueName);
    expect(consumeResult.isRight()).toBe(true);
    expect(consumeResult.value).toBe(message);
  });
});
