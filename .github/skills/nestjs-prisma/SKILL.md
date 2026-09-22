---
name: nestjs-prisma
description: "Use when: working with NestJS modules, Prisma repositories, or database adapters in this backend."
---

# NestJS + Prisma

## Pattern used here
- `src/infra` is the adapter layer. Prisma is used there, not in the domain.
- Repository interfaces come from `src/domain/application` and are implemented in `src/infra`.
- `src/infra/shared/database/database.module.ts` wires the implementations.
- `src/infra/shared/database/prisma` contains Prisma access and mapping logic.

## Rules
- Keep business rules out of Prisma repositories and mappers.
- Use `@Injectable()` and `@Module()` only for wiring infrastructure.
- Controllers delegate to use cases; they do not access Prisma directly.

## Example
```ts
@Module({
  providers: [
    PrismaService,
    { provide: CategoriesRepository, useClass: PrismaCategoriesRepository },
  ],
  exports: [PrismaService, CategoriesRepository],
})
export class DatabaseModule {}
```

## Do not do
- Do not put Prisma calls in `src/domain`.
- Do not put domain validation in repositories.
- Do not create business rules in a mapper.
- Do not access the database directly from controllers or use cases.
