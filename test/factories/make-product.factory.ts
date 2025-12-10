import { faker } from '@faker-js/faker/locale/pt_BR';

import { ID } from '@/core/entities/id';
import { Product } from '@/domain/enterprise/entities/product';
import { Price } from '@/domain/enterprise/entities/value-objects/price';

interface MakeProductProps {
  title?: string;
  description?: string;
  ownerId?: string;
  price?: number;
  category?: string;
}

export function makeProductFactory(props: MakeProductProps = {}, id?: ID) {
  return Product.create(
    {
      title: props.title ?? faker.commerce.product(),
      description: props.description ?? faker.commerce.productDescription(),
      ownerId: new ID(props.ownerId),
      category: new ID(props.category ?? faker.commerce.product().toLocaleLowerCase()),
      price: Price.createBRL(
        props.price ?? Number(faker.finance.amount({ autoFormat: true, min: 1.0, max: 100 })),
      ),
    },
    id,
  );
}
