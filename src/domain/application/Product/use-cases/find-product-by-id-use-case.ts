import { ProductFilters } from '@/core/repositories/product-filters';
import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';

import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { ProductsRepository } from '../repositories/products.repository';

interface FindProductUseCaseRequest {
  id: string;
  filters?: ProductFilters;
}

type FindProductUseCaseResponse = Either<InvalidProductIdError, { product: Product | Partial<Product> }>;

export class FindProductByIdUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  /**
   * Sem `filters`: delega para `findById` e devolve o `Product` completo.
   * Com `filters`: delega para `findByIdPartial` e devolve apenas os campos
   * selecionados (`true`) em `ProductFilters`.
   */
  async execute({ id, filters }: FindProductUseCaseRequest): Promise<FindProductUseCaseResponse> {
    const product = filters
      ? await this.productsRepository.findByIdPartial(id, filters)
      : await this.productsRepository.findById(id);

    if (!product) return left(new InvalidProductIdError());

    return right({ product });
  }
}
