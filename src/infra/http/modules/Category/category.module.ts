import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/infra/shared/database/database.module';
import { QueueModule } from '@/infra/shared/gateways/queue/queue.module';
import { StorageModule } from '@/infra/shared/gateways/storage/storage.module';

import { CreateCategoryController } from './Create/create-category.controller';
import { CreateCategoryService } from './Create/create-category.service';

@Module({
  imports: [DatabaseModule, QueueModule, StorageModule],
  controllers: [CreateCategoryController],
  providers: [CreateCategoryService],
  exports: [CreateCategoryService],
})
export class CategoryModule {}
