import { BaseEntity } from '@/core/entities/base-entity';
import { ID } from '@/core/entities/id';
import { Optional } from '@/core/types/optional';

export interface CategoryProps {
  title: string;
  description: string;
  ownerId: ID;
  createdAt: Date;
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

  static isValidId(id: string) {
    return new ID(id).isValid();
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
