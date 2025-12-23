import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Category } from '@/domain/enterprise/entities/category';

import { Queue } from '../../shared/gateways/queue.gateway';
import { Storage } from '../../shared/gateways/storage.gateway';
import { GatewayUtils } from '../../shared/gateways/utils/gateway.utils';
import { InvalidCategoryIdError } from '../errors/invalid-category-id.error';
import { InvalidCategoryOwnerIdError } from '../errors/invalid-category-owner-id.error';
import { CategoriesRepository } from '../repositories/categories.repository';

interface UpdateCategoryUseCaseRequest {
  title?: string;
  description?: string;
  ownerId?: string;
}

type UpdateCategoryUseCaseResponse = Either<
  InvalidCategoryIdError | InvalidCategoryOwnerIdError,
  { category: Category }
>;

export class UpdateCategoryUseCase {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {}

  async execute(
    id: string,
    { title, description, ownerId }: UpdateCategoryUseCaseRequest,
  ): Promise<UpdateCategoryUseCaseResponse> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) return left(new InvalidCategoryIdError());

    if (ownerId && !Category.isValidId(ownerId)) return left(new InvalidCategoryOwnerIdError());

    if (title !== undefined) category.setTitle(title);

    if (description !== undefined) category.setDescription(description);

    if (ownerId !== undefined) category.setOwnerId(new ID(ownerId));

    await this.categoriesRepository.update(category);

    // Send message to the queue
    await GatewayUtils.sendCategoryMessageToQueue(this.queue, 'catalog-emit', category);

    // Save message to storage
    await GatewayUtils.saveCategoryMessageToStorage(this.storage, 'catalog-emit', category);

    return right({ category });
  }
}
