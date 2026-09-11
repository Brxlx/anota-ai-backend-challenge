import { Module } from '@nestjs/common';

import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';
import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';

import { EnvModule } from '../env/env.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaCategoriesRepository } from './prisma/repositories/prisma-categories.repository';
import { PrismaProductsRepository } from './prisma/repositories/prisma-products.repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: CategoriesRepository,
      useClass: PrismaCategoriesRepository,
    },
    {
      provide: ProductsRepository,
      useClass: PrismaProductsRepository,
    },
  ],
  exports: [PrismaService, CategoriesRepository, ProductsRepository],
})
export class DatabaseModule {}
