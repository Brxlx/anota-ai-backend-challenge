/* eslint-disable @typescript-eslint/require-await */
import { ProductFilters } from '@/core/repositories/product-filters';
import {
  ProductsRepository,
  ProductUpdateData,
} from '@/domain/application/Product/repositories/products.repository';
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

  async findByIdPartial(id: string, filters: ProductFilters): Promise<Partial<Product> | null> {
    const product = this.items.get(id);

    if (!product) return null;

    // `title`, `description`, `price`, `ownerId`, `category`, `createdAt` e
    // `updatedAt` em `Product` são somente leitura (getters sem setter
    // correspondente). Além disso, os métodos públicos `setX` mutam a instância
    // armazenada em `items` e disparam `touch()` — nunca devem ser usados
    // aqui, já que isto é uma leitura. Por isso o objeto é montado inteiro em
    // uma única expressão (spread condicional), nunca por atribuição após a
    // criação.
    return {
      id: product.id,
      ...(filters.title && { title: product.title }),
      ...(filters.description && { description: product.description }),
      ...(filters.price && { price: product.price }),
      ...(filters.ownerId && { ownerId: product.ownerId }),
      ...(filters.category && { category: product.category }),
      ...(filters.createdAt && { createdAt: product.createdAt }),
      ...(filters.updatedAt && { updatedAt: product.updatedAt }),
    };
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
  // `changes` existe só para espelhar a assinatura de `ProductsRepository`;
  // o double em memória não distingue persistência parcial de total, então
  // simplesmente guarda a entidade já atualizada.
  async update(product: Product, _changes: ProductUpdateData): Promise<void> {
    const id = product.id.toString();

    if (this.items.has(id)) {
      this.items.set(id, product);
    }
  }
  async delete(productId: string): Promise<void> {
    this.items.delete(productId);
  }
}
