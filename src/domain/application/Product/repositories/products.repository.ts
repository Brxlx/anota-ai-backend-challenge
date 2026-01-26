import { Product } from '@/domain/enterprise/entities/product';

export abstract class ProductsRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findByTitle(title: string): Promise<Product | null>;
  abstract create(product: Product): Promise<Product>;
  abstract update(product: Product): Promise<void>;
  abstract delete(productId: string): Promise<void>;
}
