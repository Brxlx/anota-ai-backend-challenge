/* eslint-disable @typescript-eslint/require-await */
import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';
import { Product } from '@/domain/enterprise/entities/product';

export class InMemoryProductsRepository implements ProductsRepository {
  // public items: Product[] = [];
  public items = new Map<string, Product>();

  async findAll(): Promise<Product[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.items.get(id);

    if (!product) return null;

    return product;
  }

  async findByTitle(title: string): Promise<Product | null> {
    const product = Array.from(this.items.values()).find((item) => item.title === title);

    if (!product) return null;

    return product;
  }

  async create(product: Product): Promise<Product> {
    this.items.set(product.id.toString(), product);

    return product;
  }
  async update(product: Product): Promise<void> {
    const id = product.id.toString();

    if (this.items.has(id)) {
      this.items.set(id, product);
    }
  }
  async delete(productId: string): Promise<void> {
    this.items.delete(productId);
  }
}
