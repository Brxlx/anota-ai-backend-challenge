import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';

import { Queue } from '../../shared/gateways/queue.gateway';
import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { ProductsRepository } from '../repositories/products.repository';

interface DeleteProductUseCaseRequest {
  id: string;
}

type DeleteProductUseCaseResponse = Either<InvalidProductIdError, Product[]>;

export class DeleteProductByIdUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly queue: Queue,
  ) {}

  async execute({ id }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
    if (!Product.isValidId(id)) return left(new InvalidProductIdError());

    const findInDb = await this.productsRepository.findById(id);

    if (!findInDb) return left(new Error('Id not found'));

    await this.productsRepository.delete(id);

    const updatedProducts = await this.productsRepository.findAll();

    console.log(updatedProducts);

    // await this.queue.produce('catalog-emit', this.buildProductMessage(findInDb));

    return right(updatedProducts);
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
    });
  }
}
