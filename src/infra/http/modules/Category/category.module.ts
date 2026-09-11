import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/infra/shared/database/database.module';
import { QueueModule } from '@/infra/shared/gateways/queue/queue.module';
import { StorageModule } from '@/infra/shared/gateways/storage/storage.module';

import { CreateCategoryController } from './Create/create-category.controller';
import { CreateCategoryService } from './Create/create-category.service';
import { DeleteCategoryByIdService } from './Delete/delete-category.service';
import { DeleteCategoryByIdCategoryController } from './Delete/delete-category-by-id.controller';
import { FindCategoryByIdController } from './Find/find-category.controller';
import { FindCategoryByIdService } from './Find/find-category.service';
import { UpdateCategoryController } from './Update/update-category.controller';
import { UpdateCategoryService } from './Update/update-category.service';

@Module({
  imports: [DatabaseModule, QueueModule, StorageModule],
  controllers: [
    CreateCategoryController,
    DeleteCategoryByIdCategoryController,
    FindCategoryByIdController,
    UpdateCategoryController,
  ],
  providers: [
    CreateCategoryService,
    DeleteCategoryByIdService,
    FindCategoryByIdService,
    UpdateCategoryService,
  ],
  exports: [CreateCategoryService, DeleteCategoryByIdService, FindCategoryByIdService, UpdateCategoryService],
})
export class CategoryModule {}
