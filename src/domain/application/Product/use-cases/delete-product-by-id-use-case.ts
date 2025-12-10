import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';

import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { ProductsRepository } from '../repositories/products.repository';

interface DeleteProductUseCaseRequest {
  id: string;
}

type DeleteProductUseCaseResponse = Either<InvalidProductIdError, null>;

export class DeleteProductByIdUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({ id }: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
    if (!Product.isValidId(id)) return left(new InvalidProductIdError());

    await this.productsRepository.delete(id);

    return right(null);
  }
}
