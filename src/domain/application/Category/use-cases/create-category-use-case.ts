import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Category } from '@/domain/enterprise/entities/category';

import { InvalidOwnerIdError } from '../errors/invalid-owner-id.error';
import { CategoriesRepository } from '../repositories/categories.repository';

interface CreateCategoryUseCaseRequest {
  title: string;
  description: string;
  ownerId: string;
}

type CreateCategoryUseCaseResponse = Either<InvalidOwnerIdError, { category: Category }>;

export class CreateCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  public async execute({
    title,
    description,
    ownerId,
  }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    if (!Category.isValidOwnerId(ownerId)) return left(new InvalidOwnerIdError());

    const category = Category.create({
      title,
      description,
      ownerId: new ID(ownerId),
    });

    const newCategory = await this.categoriesRepository.create(category);

    return right({ category: newCategory });
  }
}
