import { CoreEnv } from '@/domain/application/shared/env/env';

interface FakeEnvProps {
  region: string;
  endpoint: string;
  queueName: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class FakeEnv implements CoreEnv<FakeEnvProps> {
  private readonly values: FakeEnvProps = {
    region: 'us-east-1',
    endpoint: 'http://localhost:4566',
    queueName: 'test-queue',
    credentials: {
      accessKeyId: 'fake-access-key',
      secretAccessKey: 'fake-secret-key',
    },
  };

  get<K extends keyof FakeEnvProps>(key: K): FakeEnvProps[K] {
    return this.values[key];
  }
}
