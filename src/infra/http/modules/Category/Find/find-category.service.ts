import { Injectable } from '@nestjs/common';

import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';
import { FindCategoryByIdUseCase } from '@/domain/application/Category/use-cases/find-category-by-id-use-case';

@Injectable()
export class FindCategoryByIdService extends FindCategoryByIdUseCase {
  constructor(categoriesRepository: CategoriesRepository) {
    super(categoriesRepository);
  }
}
