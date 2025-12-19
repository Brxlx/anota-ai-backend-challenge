/* eslint-disable @typescript-eslint/require-await */
import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';
import { Product } from '@/domain/enterprise/entities/product';

export class InMemoryProductsRepository implements ProductsRepository {
  async findAll(): Promise<Product[]> {
    return this.items;
  }
  public items: Product[] = [];

  async findById(id: string): Promise<Product | null> {
    const product = this.items.find((item) => item.id.toString() === id);

    if (!product) return null;

    return product;
  }
  async create(product: Product): Promise<Product> {
    this.items.push(product);

    return product;
  }
  async update(product: Product): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === product.id.toString());

    if (index >= 0) {
      this.items[index] = product;
    }
  }
  async delete(productId: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === productId);

    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }
}
