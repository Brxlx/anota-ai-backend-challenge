import { Injectable } from '@nestjs/common';

import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';
import { DeleteCategoryByIdUseCase } from '@/domain/application/Category/use-cases/delete-category-by-id-use-case';

@Injectable()
export class DeleteCategoryByIdService extends DeleteCategoryByIdUseCase {
  constructor(categoriesRepository: CategoriesRepository) {
    super(categoriesRepository);
  }
}
