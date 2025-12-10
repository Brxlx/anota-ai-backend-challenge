import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';

import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { ProductsRepository } from '../repositories/products.repository';

interface FindProductUseCaseRequest {
  id: string;
}

type FindProductUseCaseResponse = Either<InvalidProductIdError, { product: Product }>;

export class FindProductByIdUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({ id }: FindProductUseCaseRequest): Promise<FindProductUseCaseResponse> {
    const product = await this.productsRepository.findById(id);

    if (!product) return left(new InvalidProductIdError());

    return right({ product });
  }
}
