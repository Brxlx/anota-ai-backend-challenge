import { Either, left, right } from '@/core/types/either';
import { Category } from '@/domain/enterprise/entities/category';

import { InvalidCategoryIdError } from '../errors/invalid-category-id.error';
import { CategoriesRepository } from '../repositories/categories.repository';

interface DeleteCategoryUseCaseRequest {
  id: string;
}

type DeleteCategoryUseCaseResponse = Either<InvalidCategoryIdError, Category[]>;

export class DeleteCategoryByIdUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute({ id }: DeleteCategoryUseCaseRequest): Promise<DeleteCategoryUseCaseResponse> {
    if (!Category.isValidId(id)) return left(new InvalidCategoryIdError());

    await this.categoriesRepository.delete(id);

    const updatedCategories = await this.categoriesRepository.findAll();

    return right(updatedCategories);
  }
}
