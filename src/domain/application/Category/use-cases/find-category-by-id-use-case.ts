import { Either, left, right } from '@/core/types/either';
import { Category } from '@/domain/enterprise/entities/category';

import { InvalidCategoryIdError } from '../errors/invalid-category-id.error';
import { CategoriesRepository } from '../repositories/categories.repository';

interface FindCategoryUseCaseRequest {
  id: string;
}

type FindCategoryUseCaseResponse = Either<InvalidCategoryIdError, { category: Category }>;

export class FindCategoryByIdUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute({ id }: FindCategoryUseCaseRequest): Promise<FindCategoryUseCaseResponse> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) return left(new InvalidCategoryIdError());

    return right({ category });
  }
}
