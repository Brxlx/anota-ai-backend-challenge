import { Product as PrismaProduct, Prisma } from '@/../generated/prisma/client';
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
