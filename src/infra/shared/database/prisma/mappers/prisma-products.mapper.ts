import { Prisma, Product as PrismaProduct } from '@generated/prisma/client';

import { ID } from '@/core/entities/id';
import { Product } from '@/domain/enterprise/entities/product';
import { Price } from '@/domain/enterprise/entities/value-objects/price';

export class PrismaProductsMapper {
  static toDomain(this: void, raw: PrismaProduct): Product {
    return Product.create(
      {
        title: raw.title,
        description: raw.description,
        price: Price.createBRL(raw.price),
        ownerId: new ID(raw.ownerId),
        category: new ID(raw.categoryId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new ID(raw.id),
    );
  }

  /**
   * Mapeia um `Product` do Prisma obtido com `select` (projeção parcial de
   * campos, ver `ProductFilters`) para um `Partial<Product>` de domínio.
   *
   * Ao contrário de `toDomain`, não instancia um `Product` completo (o que
   * exigiria valores padrão artificiais para os campos não selecionados) —
   * apenas traduz, campo a campo, o que de fato veio do banco. `id` é sempre
   * obrigatório, pois é ele quem identifica a entidade.
   */
  static toDomainPartial(
    this: void,
    raw: Partial<PrismaProduct> & { id: string },
  ): Partial<Product> & { id: ID } {
    // `title`, `description`, `price`, `ownerId` e `createdAt` em `Product` são
    // somente leitura (getters sem setter correspondente — os `setX` públicos
    // mutam a entidade e disparam `touch()`, o que não se aplica aqui).
    // Por isso o objeto precisa ser montado inteiro em uma única expressão
    // (spread condicional), nunca por atribuição após a criação.
    return {
      id: new ID(raw.id),
      ...(raw.title !== undefined && { title: raw.title }),
      ...(raw.description !== undefined && { description: raw.description }),
      ...(raw.price !== undefined && { price: Price.createBRL(raw.price) }),
      ...(raw.ownerId !== undefined && { ownerId: new ID(raw.ownerId) }),
      ...(raw.categoryId !== undefined && { category: new ID(raw.categoryId) }),
      ...(raw.createdAt !== undefined && { createdAt: raw.createdAt }),
      ...(raw.updatedAt !== undefined && { updatedAt: raw.updatedAt }),
    };
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id.toValue(),
      title: product.title,
      description: product.description,
      price: product.price.amount,
      ownerId: product.ownerId.toValue(),
      categoryId: product.category.toValue(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt || undefined,
    };
  }
}
