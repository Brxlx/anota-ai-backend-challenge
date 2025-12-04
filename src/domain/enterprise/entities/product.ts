import { BaseEntity } from '@/core/entities/base-entity';
import { ID } from '@/core/entities/id';
import { Optional } from '@/core/types/optional';

import { Price } from './value-objects/price';

export interface ProductProps {
  title: string;
  description: string;
  price: Price;
  ownerId: ID;
  category: ID;
  createdAt: Date;
}

export class Product extends BaseEntity<ProductProps> {
  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get ownerId() {
    return this.props.ownerId;
  }

  get price() {
    return this.props.price;
  }

  get category() {
    return this.props.category;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(props: Optional<ProductProps, 'createdAt'>, id?: ID) {
    return new Product(
      {
        ...props,
        // price: props.price ?? new Price({ amount: props.price, currency: 'pt-BR' }),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
