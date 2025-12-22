/* eslint-disable @typescript-eslint/require-await */
import { CategoriesRepository } from '@/domain/application/Category/repositories/categories.repository';
import { Category } from '@/domain/enterprise/entities/category';

export class InMemoryCategoriesRepository implements CategoriesRepository {
  public items = new Map<string, Category>();

  async findAll(): Promise<Category[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<Category | null> {
    const category = this.items.get(id);

    if (!category) return null;

    return category;
  }
  async create(category: Category): Promise<Category> {
    this.items.set(category.id.toString(), category);

    return category;
  }
  async update(category: Category): Promise<void> {
    const id = category.id.toString();

    if (this.items.has(id)) {
      this.items.set(id, category);
    }
  }
  async delete(categoryId: string): Promise<void> {
    this.items.delete(categoryId);
  }
}
