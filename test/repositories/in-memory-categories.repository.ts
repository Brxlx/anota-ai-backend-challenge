/* eslint-disable @typescript-eslint/require-await */
import {
  CategoriesRepository,
  CategoryUpdateData,
} from '@/domain/application/Category/repositories/categories.repository';
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

  async findByTitle(title: string): Promise<Category | null> {
    const category = Array.from(this.items.values()).find((item) => item.title === title);

    if (!category) return null;

    return category;
  }

  async create(category: Category): Promise<Category> {
    this.items.set(category.id.toString(), category);

    return category;
  }
  // `changes` existe só para espelhar a assinatura de `CategoriesRepository`;
  // o double em memória não distingue persistência parcial de total, então
  // simplesmente guarda a entidade já atualizada.
  async update(category: Category, _changes: CategoryUpdateData): Promise<void> {
    const id = category.id.toString();

    if (this.items.has(id)) {
      this.items.set(id, category);
    }
  }
  async delete(categoryId: string): Promise<void> {
    this.items.delete(categoryId);
  }
}
