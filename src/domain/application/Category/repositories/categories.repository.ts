import { Category } from '@/domain/enterprise/entities/category';

/**
 * Campos que podem ser alterados em um `PATCH /categories/:id`. Usado pelo
 * repositório para persistir somente o que de fato veio no corpo da
 * requisição, em vez de reescrever todas as colunas com o snapshot atual
 * da entidade.
 */
export interface CategoryUpdateData {
  title?: string;
  description?: string;
  ownerId?: string;
}

export abstract class CategoriesRepository {
  abstract findAll(): Promise<Category[]>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findByTitle(title: string): Promise<Category | null>;
  abstract create(category: Category): Promise<Category>;
  /**
   * `category` é a entidade já atualizada em memória (usada para devolver a
   * resposta e para `updatedAt`). `changes` traz somente os campos que
   * vieram no PATCH, para que a implementação persista apenas o que mudou.
   */
  abstract update(category: Category, changes: CategoryUpdateData): Promise<void>;
  abstract delete(categoryId: string): Promise<void>;
}
