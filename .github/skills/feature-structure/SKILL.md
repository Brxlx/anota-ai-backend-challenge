---
name: feature-structure
description: "Use when: creating or changing a feature, repository, or HTTP module in this codebase."
---

# Feature structure

## Pattern used here
Each feature follows the same layout:

- `src/domain/application/<Feature>/repositories/*.repository.ts`
- `src/domain/application/<Feature>/use-cases/*.use-case.ts`
- `src/domain/application/<Feature>/errors/*.error.ts`
- `src/infra/http/modules/<Feature>/`

## Rules
- Create or update the repository contract before implementing the Prisma adapter.
- Keep the use case in the application layer and the HTTP adapter in `src/infra/http/modules`.
- Put intrinsic domain validation in entities or value objects.
- Keep NestJS modules and Prisma repositories as infrastructure adapters only.

## Example
```ts
export abstract class ProductsRepository {
  abstract findById(id: string): Promise<Product | null>;
  abstract create(product: Product): Promise<Product>;
  abstract update(product: Product): Promise<void>;
}
```

## Do not do
- Do not create repository implementations inside `src/domain`.
- Do not put Prisma calls inside domain classes.
- Do not add feature logic to controllers when a use case already exists.
- Do not invent a different folder structure for the same feature.
