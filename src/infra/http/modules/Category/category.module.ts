import { Module } from '@nestjs/common';

import { CreateCategoryController } from './Create/create-category.controller';
import { CreateCategoryService } from './Create/create-category.service';

@Module({
  imports: [],
  controllers: [CreateCategoryController],
  providers: [CreateCategoryService],
  exports: [CreateCategoryService],
})
export class CategoryModule {}
