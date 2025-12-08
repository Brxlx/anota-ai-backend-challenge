import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Category } from '@/domain/enterprise/entities/category';

import { InvalidCategoryIdError } from '../errors/invalid-category-id.error';
import { InvalidOwnerIdError } from '../errors/invalid-owner-id.error';
import { CategoriesRepository } from '../repositories/categories.repository';

interface UpdateCategoryUseCaseRequest {
  title?: string;
  description?: string;
  ownerId?: string;
}

type UpdateCategoryUseCaseResponse = Either<
  InvalidCategoryIdError | InvalidOwnerIdError,
  { category: Category }
>;

export class UpdateCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(
    id: string,
    { title, description, ownerId }: UpdateCategoryUseCaseRequest,
  ): Promise<UpdateCategoryUseCaseResponse> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) return left(new InvalidCategoryIdError());

    if (ownerId && !Category.isValidId(ownerId)) return left(new InvalidOwnerIdError());

    if (title !== undefined) category.setTitle(title);

    if (description !== undefined) category.setDescription(description);

    if (ownerId !== undefined) category.setOwnerId(new ID(ownerId));

    await this.categoriesRepository.update(category);

    return right({ category });
  }
}
