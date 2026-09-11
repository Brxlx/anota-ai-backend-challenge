import { Injectable } from '@nestjs/common';

import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';
import { UpdateCategoryUseCase } from '@/domain/application/Category/use-cases/update-category-use-case';
import { Queue } from '@/domain/application/shared/gateways/queue.gateway';
import { Storage } from '@/domain/application/shared/gateways/storage.gateway';

@Injectable()
export class UpdateCategoryService extends UpdateCategoryUseCase {
  constructor(categoriesRepository: CategoriesRepository, queue: Queue, storage: Storage) {
    super(categoriesRepository, queue, storage);
  }
}
