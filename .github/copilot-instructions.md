# Copilot Instructions for anota-ai

## Architecture
This project follows a clean architecture split:

- `src/domain/enterprise`: entities, value objects, and domain rules.
- `src/domain/application`: use cases, repository contracts, and errors.
- `src/core`: shared abstractions such as `ID`, `Either`, `BaseEntity`, and `AggregateRoot`.
- `src/infra`: NestJS, Prisma, HTTP, queue, storage, and external integrations.

The dependency rule is strict: domain code must not import Nest, Prisma, HTTP classes, or external service libraries.

## Project conventions
- Use `camelCase` for variables and methods; `PascalCase` for classes; `kebab-case` for files.
- Keep each feature under `src/domain/application/<Feature>/` and `src/infra/http/modules/<Feature>/`.
- Repository interfaces belong in `src/domain/application/<Feature>/repositories`.
- Use cases belong in `src/domain/application/<Feature>/use-cases` and should return `Either`.
- Domain validation belongs in entities or value objects.
- HTTP modules and controllers are adapters only; they delegate to use cases.

## Clean code rules
- Keep constructors explicit and dependency-injected.
- Keep business logic out of controllers, repositories, and mappers.
- Validate early and return `left(...)` for domain/application failures.
- Prefer small methods with one responsibility and composition over concrete coupling.

## Testing rules
- Unit tests stay next to the use case or domain logic they validate.
- Prefer `InMemory*Repository` and fake gateways from `test/` instead of mocking the business layer.
- Assert real outcomes: repository state and `Either` results.
- Test names should follow `should be able to ...` and `should throw error ...`.

## Commands
- Install: `pnpm install`
- Start dev: `pnpm run dev`
- Run tests: `pnpm run test`
- Run coverage: `pnpm run test:cov`
- Run e2e: `pnpm run test:e2e`

---
This file is the global baseline; feature-specific guidance lives in the skills under `.github/skills`.
