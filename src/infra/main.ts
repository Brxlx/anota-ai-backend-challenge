import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/infra/app.module';

import { App } from './setup/App';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await new App(app).run();
}

void bootstrap();
