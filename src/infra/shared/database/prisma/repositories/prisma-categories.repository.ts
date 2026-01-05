import { Injectable } from '@nestjs/common';

import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';
import { Category } from '@/domain/enterprise/entities/category';

import { PrismaCategoriesMapper } from '../mappers/prisma-categories.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.prismaService.category.findMany();

    return categories.map(PrismaCategoriesMapper.toDomain);
  }
  async findById(id: string): Promise<Category | null> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      return null;
    }

    return PrismaCategoriesMapper.toDomain(category);
  }
  async create(category: Category): Promise<Category> {
    const raw = PrismaCategoriesMapper.toPrisma(category);
    const createdCategory = await this.prismaService.category.create({
      data: raw,
    });

    return PrismaCategoriesMapper.toDomain(createdCategory);
  }
  async update(category: Category): Promise<void> {
    const raw = PrismaCategoriesMapper.toPrisma(category);
    await this.prismaService.category.update({
      where: { id: raw.id },
      data: raw,
    });
  }
  async delete(categoryId: string): Promise<void> {
    await this.prismaService.category.delete({
      where: { id: categoryId },
    });
  }
}
