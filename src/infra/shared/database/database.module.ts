import { Module } from '@nestjs/common';

import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';

import { EnvModule } from '../env/env.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaCategoriesRepository } from './prisma/repositories/prisma-categories.repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: CategoriesRepository,
      useClass: PrismaCategoriesRepository,
    },
  ],
  exports: [PrismaService, CategoriesRepository],
})
export class DatabaseModule {}
