import { Either, left, right } from '@/core/types/either';
import { Category } from '@/domain/enterprise/entities/category';

import { CategoryIdNotFoundError } from '../errors/category-id-not-found.error';
import { InvalidCategoryIdError } from '../errors/invalid-category-id.error';
import { CategoriesRepository } from '../repositories/categories.repository';

interface DeleteCategoryUseCaseRequest {
  id: string;
}

type DeleteCategoryUseCaseResponse = Either<InvalidCategoryIdError | CategoryIdNotFoundError, Category[]>;

export class DeleteCategoryByIdUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute({ id }: DeleteCategoryUseCaseRequest): Promise<DeleteCategoryUseCaseResponse> {
    if (!Category.isValidId(id)) return left(new InvalidCategoryIdError());

    const findInDb = await this.categoriesRepository.findById(id);

    if (!findInDb) return left(new CategoryIdNotFoundError());

    await this.categoriesRepository.delete(id);

    const updatedCategories = await this.categoriesRepository.findAll();

    return right(updatedCategories);
  }
}
