import { PaginatedResult, PaginationParams } from '@/core/repositories/pagination-params';
import { ProductFilters } from '@/core/repositories/product-filters';
import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';

import { InvalidPaginationCursorError } from '../errors/invalid-pagination-cursor.error';
import { ProductsRepository } from '../repositories/products.repository';

interface ListProductsUseCaseRequest extends PaginationParams {
  filters?: ProductFilters;
}

type FindProductsUseCaseResponse = Either<
  InvalidPaginationCursorError,
  PaginatedResult<Product | Partial<Product>>
>;

/**
 * Lista produtos com paginação por cursor (keyset), delegando ao
 * repositório a travessia da coleção.
 *
 * Sem `filters`: cada item da página vem como `Product` completo.
 * Com `filters`: cada item vem como `Partial<Product>` — mesmo contrato de
 * projeção usado em `FindProductByIdUseCase` (ver `ProductFilters`).
 *
 * O formato do `cursor` já é validado na camada HTTP (`ID.isValid()`, em
 * `list-product.schema.ts`); a única falha tratada aqui é o repositório
 * não conseguir resolver esse `cursor` para uma posição na coleção.
 */
export class FindProductsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    cursor,
    limit,
    filters,
  }: ListProductsUseCaseRequest): Promise<FindProductsUseCaseResponse> {
    try {
      const result = await this.productsRepository.findManyPartial({ cursor, limit }, filters ?? {});

      return right(result);
    } catch {
      return left(new InvalidPaginationCursorError());
    }
  }
}
