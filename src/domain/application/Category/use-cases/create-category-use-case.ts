import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Category } from '@/domain/enterprise/entities/category';

import { Queue } from '../../shared/gateways/queue.gateway';
import { Storage } from '../../shared/gateways/storage.gateway';
import { GatewayUtils } from '../../shared/gateways/utils/gateway.utils';
import { CategoryAlreadyExistsError } from '../errors/category-already-exists.error';
import { InvalidCategoryOwnerIdError } from '../errors/invalid-category-owner-id.error';
import { CategoriesRepository } from '../repositories/categories.repository';

interface CreateCategoryUseCaseRequest {
  title: string;
  description: string;
  ownerId: string;
}

type CreateCategoryUseCaseResponse = Either<
  InvalidCategoryOwnerIdError | CategoryAlreadyExistsError,
  { category: Category }
>;

export class CreateCategoryUseCase {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {}

  public async execute({
    title,
    description,
    ownerId,
  }: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
    if (!Category.isValidId(ownerId)) return left(new InvalidCategoryOwnerIdError());

    const categoryAlreadyInDb = await this.categoriesRepository.findByTitle(title);

    if (categoryAlreadyInDb) return left(new CategoryAlreadyExistsError());

    const category = Category.create({
      title,
      description,
      ownerId: new ID(ownerId),
    });

    // TODO: Buscar pelo nome da categoria

    // Update in DB
    const newCategory = await this.categoriesRepository.create(category);

    // Send message to the queue
    await GatewayUtils.sendCategoryMessageToQueue(this.queue, 'catalog-emit', newCategory);

    // Save message to storage
    await GatewayUtils.saveCategoryMessageToStorage(this.storage, 'catalog-emit', newCategory);

    return right({ category: newCategory });
  }
}
