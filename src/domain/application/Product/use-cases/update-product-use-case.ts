import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';

import { Queue } from '../../shared/gateways/queue.gateway';
import { Storage } from '../../shared/gateways/storage.gateway';
import { GatewayUtils } from '../../shared/gateways/utils/gateway.utils';
import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { InvalidProductOwnerIdError } from '../errors/invalid-product-owner-id.error';
import { ProductsRepository } from '../repositories/products.repository';

interface UpdateProductUseCaseRequest {
  title?: string;
  description?: string;
  ownerId?: string;
  price?: number;
  category?: string;
}

type UpdateProductUseCaseResponse = Either<
  InvalidProductIdError | InvalidProductOwnerIdError,
  { product: Product }
>;

export class UpdateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {}

  async execute(
    id: string,
    { title, description, ownerId, price, category }: UpdateProductUseCaseRequest,
  ): Promise<UpdateProductUseCaseResponse> {
    if (ownerId && !this.isValidOwnerId(ownerId)) return left(new InvalidProductOwnerIdError());

    const product = await this.productsRepository.findById(id);
    if (!product) return left(new InvalidProductIdError());

    const updatedProduct = this.validateRequestBody(
      { title, description, ownerId, price, category },
      product,
    );

    await this.productsRepository.update(updatedProduct);

    // Send to queue
    await this.sendProductToQueue(this.queue, 'catalog-emit', updatedProduct);

    // Save to storage
    await this.sendProductToStorage(this.storage, 'catalog-emit', updatedProduct);

    return right({ product: updatedProduct });
  }

  private isValidOwnerId(ownerId: string): boolean {
    return Product.isValidId(ownerId);
  }

  private isValidProductId(productId: string): boolean {
    return Product.isValidId(productId);
  }

  private validateRequestBody(request: UpdateProductUseCaseRequest, product: Product): Product {
    if (request.title !== undefined) product.setTitle(request.title);

    if (request.description !== undefined) product.setDescription(request.description);

    if (request.ownerId !== undefined) product.setOwnerId(new ID(request.ownerId));

    if (request.price !== undefined) product.setPrice(request.price);

    if (request.category !== undefined) product.setCategory(request.category);

    return product;
  }

  private async sendProductToQueue(
    queue: Queue,
    topic: string,
    product: Product,
  ): Promise<Either<Error, boolean>> {
    try {
      await GatewayUtils.saveProductMessageToQueue(queue, topic, product);
      return right(true);
    } catch {
      return left(new Error('Error trying to update queue'));
    }
  }

  private async sendProductToStorage(
    storage: Storage,
    topic: string,
    product: Product,
  ): Promise<Either<Error, boolean>> {
    try {
      await GatewayUtils.saveProductMessageToStorage(storage, topic, product);
      return right(true);
    } catch {
      return left(new Error('Error trying to update storage'));
    }
  }
}
