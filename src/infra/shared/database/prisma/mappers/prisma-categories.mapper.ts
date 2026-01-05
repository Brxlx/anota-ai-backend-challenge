import { Category as PrismaCategory, Prisma } from '@/../generated/prisma/client';
import { ID } from '@/core/entities/id';
import { Category } from '@/domain/enterprise/entities/category';

export class PrismaCategoriesMapper {
  static toDomain(this: void, raw: PrismaCategory): Category {
    return Category.create(
      {
        title: raw.title,
        description: raw.description,
        ownerId: new ID(raw.ownerId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new ID(raw.id),
    );
  }

  static toPrisma(category: Category): Prisma.CategoryUncheckedCreateInput {
    return {
      id: category.id.toValue(),
      title: category.title,
      description: category.description,
      ownerId: category.ownerId.toValue(),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt || undefined,
    };
  }
}
