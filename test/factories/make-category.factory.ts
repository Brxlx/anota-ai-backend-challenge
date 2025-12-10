import { faker } from '@faker-js/faker/locale/pt_BR';

import { ID } from '@/core/entities/id';
import { Category } from '@/domain/enterprise/entities/category';

interface MakeCategoryProps {
  title?: string;
  description?: string;
  ownerId?: string;
}

export function makeCategoryFactory(props: MakeCategoryProps = {}, id?: ID) {
  return Category.create(
    {
      title: props.title ?? faker.commerce.product(),
      description: props.description ?? faker.commerce.productDescription(),
      ownerId: new ID(props.ownerId),
    },
    id,
  );
}
