---
name: clean-architecture
description: "Use when: adding or changing domain entities, use cases, repositories, or infra adapters in this clean architecture backend."
---

# Clean architecture

## Rule
Keep the dependency direction stable:

- `src/domain/enterprise`: entities, value objects, and business rules
- `src/domain/application`: use cases, repository contracts, and domain errors
- `src/core`: shared abstractions like `ID`, `Either`, and base entities
- `src/infra`: NestJS, Prisma, HTTP, queue, storage, and external integrations

Domain code must not import Nest, Prisma, HTTP classes, or external SDKs.

## Patterns used here
- Business validation belongs in entities and value objects.
- Orchestration rules belong in use cases.
- Repository interfaces live in the application layer.
- Infrastructure implementations live in `src/infra`.
- Controllers are thin adapters that call the use case.

## Example
```ts
export class Product extends BaseEntity<ProductProps> {
  static isValidId(id: string) {
    return new ID(id).isValid();
  }
}
```

```ts
export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {}

  async execute(input: { ownerId: string }) {
    if (!Product.isValidId(input.ownerId)) return left(new InvalidProductOwnerIdError());

    const product = Product.create({ ownerId: new ID(input.ownerId), ... });
    await this.productsRepository.create(product);

    return right({ product });
  }
}
```

## Do not do
- Do not put Prisma calls in `src/domain`.
- Do not add HTTP logic to domain entities.
- Do not bypass use cases from controllers.
- Do not implement business rules in `src/infra` when the rule belongs to the domain.
