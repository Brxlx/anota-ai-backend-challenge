---
name: testing-patterns
description: "Use when: writing or fixing tests for use cases, entities, repositories, or gateway behavior in this project."
---

# Testing patterns

## What this project uses
- Tests live next to the use case or domain logic they validate.
- Repositories use `InMemory*Repository` from `test/repositories`.
- Gateways use fake implementations from `test/gateways`.
- Assertions validate repository state and `Either` results, not mock-only behavior.

## Example
```ts
const productsRepository = new InMemoryProductsRepository();
const queue = new FakeQueue();
const storage = new FakeStorage();

const sut = new UpdateProductUseCase(productsRepository, queue, storage);
const result = await sut.execute(product.id.toValue(), {
  ownerId: newOwnerId.toValue(),
});

expect(result.isRight()).toBeTruthy();
assert(result.isRight());
expect(productsRepository.items.size).toBe(1);
```

## Rules
- Use names like `should be able to ...` and `should throw error ...`.
- Validate the real final state of the repository.
- If the result is an `Either`, assert with `isLeft()` or `isRight()`.
- Do not add test-only methods to production code.

## Do not do
- Do not mock the business layer when `InMemory*Repository` or fake gateways already cover the behavior.
- Do not assert on mock internals instead of real outcomes.
- Do not place tests far from the logic they validate.
