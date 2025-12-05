import { faker } from '@faker-js/faker/locale/pt_BR';

import { ID } from '@/core/entities/id';
import { Product } from '@/domain/enterprise/entities/product';
import { Price } from '@/domain/enterprise/entities/value-objects/price';

interface MakeProductProps {
  title?: string;
  description?: string;
  ownerId?: ID;
  price?: Price;
  category?: ID;
}

export function makeProductFactory(props: MakeProductProps = {}, id?: ID) {
  return Product.create(
    {
      title: props.title ?? faker.commerce.product(),
      description: props.description ?? faker.commerce.productDescription(),
      ownerId: props.ownerId ?? new ID(),
      category: props.category ?? new ID(faker.commerce.product().toLocaleLowerCase()),
      price:
        props.price ??
        Price.createBRL(Number(faker.finance.amount({ autoFormat: true, min: 1.0, max: 100 }))),
    },
    id,
  );
}
