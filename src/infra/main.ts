import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/infra/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.APP_PORT);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
