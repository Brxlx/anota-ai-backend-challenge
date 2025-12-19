/* eslint-disable @typescript-eslint/require-await */
import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';
import { Category } from '@/domain/enterprise/entities/category';

export class InMemoryCategoriesRepository implements CategoriesRepository {
  async findAll(): Promise<Category[]> {
    return this.items;
  }
  public items: Category[] = [];

  async findById(id: string): Promise<Category | null> {
    const category = this.items.find((item) => item.id.toString() === id);

    if (!category) return null;

    return category;
  }
  async create(category: Category): Promise<Category> {
    this.items.push(category);

    return category;
  }
  async update(category: Category): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === category.id.toString());

    if (index >= 0) {
      this.items[index] = category;
    }
  }
  async delete(categoryId: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === categoryId);

    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }
}
