---
name: env-gateways
description: "Use when: working with environment variables, queues, storage, or gateway contracts in this project."
---

# Env and gateways

## Pattern used here
- Gateway contracts live in `src/domain/application/shared/gateways`.
- Environment abstractions live in `src/domain/application/shared/env`.
- Concrete implementations live in `src/infra/shared/env` and `src/infra/shared/gateways`.
- Use cases depend on interfaces such as `Queue`, `Storage`, and `CoreEnv`, not on AWS or external SDKs.

## Rules
- Keep the external SDK usage inside infrastructure adapters.
- Keep the contract in the application layer and the implementation in `src/infra`.
- Load config through the env service used by adapters.
- In tests, prefer `FakeQueue` and `FakeStorage`.

## Example
```ts
export abstract class Storage {
  abstract save(key: string, value: string): Promise<void>;
}
```

```ts
@Injectable()
export class AwsS3StorageService implements Storage {
  constructor(private readonly env: CoreEnv) {}
}
```

## Do not do
- Do not import AWS clients directly in use cases.
- Do not put env access in domain entities.
- Do not make use cases depend on concrete queue or storage providers.
- Do not create extra gateway abstractions when the shared contract pattern already exists.
