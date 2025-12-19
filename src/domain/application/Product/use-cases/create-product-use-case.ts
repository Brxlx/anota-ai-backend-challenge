import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';
import { Price } from '@/domain/enterprise/entities/value-objects/price';

import { DomainEvents } from '../../shared/events/domain-events';
import { Queue } from '../../shared/gateways/queue.gateway';
import { Storage } from '../../shared/gateways/storage.gateway';
import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { InvalidProductOwnerIdError } from '../errors/invalid-product-owner-id.error';
import { SendToQueueError } from '../errors/send-to-queue.error';
import { SendToStorageError } from '../errors/send-to-storage.error';
import { ProductsRepository } from '../repositories/products.repository';

interface CreateProductUseCaseRequest {
  title: string;
  description: string;
  ownerId: string;
  price: number;
  category: string;
}

type CreateProductUseCaseResponse = Either<InvalidProductIdError | SendToQueueError, { product: Product }>;

export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {}

  public async execute({
    title,
    description,
    ownerId,
    price,
    category,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    if (!Product.isValidId(ownerId)) return left(new InvalidProductOwnerIdError());

    const product = Product.create({
      title,
      description,
      ownerId: new ID(ownerId),
      price: Price.createBRL(price),
      category: new ID(category),
    });

    const newProduct = await this.productsRepository.create(product);

    const sendToQueueResult = await this.sendToQueue('catalog-emit', this.buildProductMessage(newProduct));

    if (sendToQueueResult.isLeft()) return left(sendToQueueResult.value);

    const sendToStorageResult = await this.saveToStorage(
      'catalog-emit',
      this.buildProductMessage(newProduct),
    );

    if (sendToStorageResult.isLeft()) return left(sendToStorageResult.value);

    DomainEvents.dispatchEventsForAggregate(newProduct.id);

    return right({ product: newProduct });
  }

  private buildProductMessage(product: Product): string {
    return JSON.stringify({
      productId: product.id.toString(),
      title: product.title,
      description: product.description,
      ownerId: product.ownerId.toString(),
      price: product.price.amount,
      categoryId: product.category.toString(),
      createdAt: product.createdAt,
      type: 'PRODUCT',
    });
  }

  private async sendToQueue(topic: string, message: string): Promise<Either<SendToQueueError, boolean>> {
    try {
      // throw new Error('teste de erro na fila');
      const { value } = await this.queue.produce(topic, message);
      return value ? right(true) : left(new SendToQueueError());
    } catch {
      return left(new SendToQueueError());
    }
  }

  private async saveToStorage(key: string, value: string): Promise<Either<SendToQueueError, boolean>> {
    try {
      await this.storage.save(key, value);
      return right(true);
    } catch {
      return left(new SendToStorageError());
    }
  }
}
