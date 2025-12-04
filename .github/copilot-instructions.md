# Copilot Instructions for anota-ai

## Project Overview
This is a NestJS-based TypeScript backend service. The codebase is organized for modularity and scalability, following NestJS conventions. Key files include:
- `src/infra/main.ts`: Application entrypoint
- `src/infra/app.module.ts`: Main module for dependency injection and configuration
- `test/app.e2e-spec.ts`: End-to-end tests

## Architecture & Patterns
- **Modular Structure**: Features and infrastructure are separated into their own directories under `src/`. Use NestJS modules and providers for encapsulation.
- **Dependency Injection**: Services, repositories, and controllers are injected via NestJS decorators (`@Injectable`, `@Module`, etc.).
- **Configuration**: App configuration is managed in `app.module.ts` and environment variables (not shown, but typical for NestJS).
- **Testing**: Unit and e2e tests are in the `test/` directory. Use NestJS testing utilities and Vitest for test execution.

## Developer Workflows
- **Install dependencies**: `pnpm install`
- **Start development server**: `pnpm run start:dev`
- **Run in production mode**: `pnpm run start:prod`
- **Run unit tests**: `pnpm run test`
- **Run e2e tests**: `pnpm run test:e2e`
- **Check test coverage**: `pnpm run test:cov`

## Conventions & Practices
- **TypeScript Strictness**: Follow strict typing and use interfaces for data contracts.
- **File Naming**: Use kebab-case for files and PascalCase for classes.
- **Testing**: Place e2e tests in `test/` and unit tests alongside implementation files or in dedicated test folders.
- **Build Config**: TypeScript configs are in `tsconfig.json` and `tsconfig.build.json`. Adjust paths and compiler options here.
- **Linting**: ESLint is configured via `eslint.config.mjs`.
- **Package Management**: Use `pnpm` for all dependency operations.

## Integration Points
- **External Services**: Integrate with external APIs/services via dedicated modules and providers.
- **Environment Variables**: Use `.env` files and NestJS ConfigModule for secrets and configuration (not present, but standard).
- **Deployment**: For cloud deployment, use [NestJS Mau](https://mau.nestjs.com) as described in the README.

## Example Patterns
- **Module Definition**:
  ```typescript
  @Module({
    imports: [...],
    providers: [...],
    controllers: [...],
  })
  export class AppModule {}
  ```
- **Service Injection**:
  ```typescript
  @Injectable()
  export class MyService {
    constructor(private readonly dep: DepService) {}
  }
  ```

## References
- [NestJS Documentation](https://docs.nestjs.com)
- See `README.md` for more details on setup and deployment.

---
*Update this file if project structure or conventions change. Feedback welcome for unclear sections.*
