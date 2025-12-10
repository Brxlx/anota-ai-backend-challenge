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
  readonly createdAt: Date;
  updatedAt?: Date | null;
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

  get updatedAt() {
    return this.props.updatedAt;
  }

  public touch() {
    // Adiciona um delay de 3 segundos à data atual
    this.props.updatedAt = new Date(Date.now() + 3000);
  }

  public setTitle(title: string) {
    this.props.title = title;
    this.touch();
  }

  public setDescription(description: string) {
    this.props.description = description;
    this.touch();
  }

  public setPrice(price: Price) {
    this.props.price = price;
    this.touch();
  }

  public setOwnerId(ownerId: ID) {
    this.props.ownerId = ownerId;
    this.touch();
  }

  public setCategory(category: ID) {
    this.props.category = category;
    this.touch();
  }

  static isValidId(id: string) {
    return new ID(id).isValid();
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
