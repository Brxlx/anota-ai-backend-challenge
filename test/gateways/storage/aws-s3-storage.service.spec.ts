import { Test, TestingModule } from '@nestjs/testing';

import { CoreEnv } from '@/domain/application/shared/env/env';
import { Env } from '@/infra/shared/env/env.schema';
import { EnvService } from '@/infra/shared/env/env.service';
import { AwsS3StorageService } from '@/infra/shared/gateways/storage/aws-s3-storage.service';

describe('AwsS3StorageService (integration)', () => {
  let service: AwsS3StorageService;
  let envService: CoreEnv<Env>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwsS3StorageService,
        {
          provide: EnvService,
          useValue: {
            get: (key: string) => {
              const env: Record<string, string> = {
                AWS_S3_BUCKET: 'test-bucket',
                DATABASE_URL: 'http://localhost:4566',
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
    service = new AwsS3StorageService(envService);
  });

  it('should save and get a message', async () => {
    const topic = 'test-topic';
    const message = 'hello s3';
    const saveResult = await service.save(topic, message);
    expect(saveResult.isRight()).toBe(true);
    const getResult = await service.get(topic);
    expect(getResult.isRight()).toBe(true);
    expect(getResult.value).toBe(message);
  });
});
