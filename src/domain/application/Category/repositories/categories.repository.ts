import { Category } from '@/domain/enterprise/entities/category';

export abstract class CategoriesRepository {
  abstract findById(id: string): Promise<Category | null>;
  abstract create(category: Category): Promise<Category>;
  abstract update(category: Category): Promise<void>;
  abstract delete(categoryId: string): Promise<void>;
}
