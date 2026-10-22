import { PaginatedResult, PaginationParams } from '@/core/repositories/pagination-params';
import { ProductFilters } from '@/core/repositories/product-filters';
import { Product } from '@/domain/enterprise/entities/product';

/**
 * Campos que podem ser alterados em um `PATCH /products/:id`. Usado pelo
 * repositório para persistir somente o que de fato veio no corpo da
 * requisição, em vez de reescrever todas as colunas com o snapshot atual
 * da entidade.
 */
export interface ProductUpdateData {
  title?: string;
  description?: string;
  ownerId?: string;
  price?: number;
  category?: string;
}

export abstract class ProductsRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findManyPartial(
    pagination: PaginationParams,
    filters?: ProductFilters,
  ): Promise<PaginatedResult<Partial<Product>>>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findByIdPartial(id: string, filters: ProductFilters): Promise<Partial<Product> | null>;
  abstract findByTitle(title: string): Promise<Product | null>;
  abstract create(product: Product): Promise<Product>;
  /**
   * `product` é a entidade já atualizada em memória (usada para devolver a
   * resposta e para `updatedAt`). `changes` traz somente os campos que
   * vieram no PATCH, para que a implementação persista apenas o que mudou.
   */
  abstract update(product: Product, changes: ProductUpdateData): Promise<void>;
  abstract delete(productId: string): Promise<void>;
}
