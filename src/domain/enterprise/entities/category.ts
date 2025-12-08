import { BaseEntity } from '@/core/entities/base-entity';
import { ID } from '@/core/entities/id';
import { Optional } from '@/core/types/optional';

export interface CategoryProps {
  title: string;
  description: string;
  ownerId: ID;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Category extends BaseEntity<CategoryProps> {
  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get ownerId() {
    return this.props.ownerId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static isValidId(id: string) {
    return new ID(id).isValid();
  }

  public setTitle(title: string) {
    this.props.title = title;
    this.touch();
  }

  public setDescription(description: string) {
    this.props.description = description;
    this.touch();
  }

  public setOwnerId(ownerId: ID) {
    this.props.ownerId = ownerId;
    this.touch();
  }

  public touch() {
    // Adiciona um delay de 3 segundos à data atual
    this.props.updatedAt = new Date(Date.now() + 3000);
  }

  static create(props: Optional<CategoryProps, 'createdAt'>, id?: ID) {
    return new Category(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
