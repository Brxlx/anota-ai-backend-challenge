# anota-ai — Guia de arquitetura e convenções

> Projeto de desafio técnico em **Clean Architecture** (Core / Domain / Infra),
> construído com **NestJS + Prisma (MongoDB) + Zod**. Este arquivo é a fonte
> única de verdade sobre arquitetura e convenções de código — ver também
> `.github/copilot-instructions.md` e `.github/skills/*/SKILL.md`, que cobrem
> o mesmo conteúdo em formato resumido para outras ferramentas de IA.

## Índice

1. [Stack e comandos](#1-stack-e-comandos)
2. [Regra de dependência entre camadas](#2-regra-de-dependência-entre-camadas)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [`src/core` — building blocks compartilhados](#4-srccore--building-blocks-compartilhados)
5. [`src/domain/enterprise` — entidades e regras de negócio](#5-srcdomainenterprise--entidades-e-regras-de-negócio)
6. [`src/domain/application` — casos de uso, contratos e eventos](#6-srcdomainapplication--casos-de-uso-contratos-e-eventos)
7. [Padrão Service = Use Case + NestJS](#7-padrão-service--use-case--nestjs)
8. [Estrutura de uma feature HTTP](#8-estrutura-de-uma-feature-http)
9. [Validação com Zod (`nestjs-zod`)](#9-validação-com-zod-nestjs-zod)
10. [Tratamento de erros (filters)](#10-tratamento-de-erros-filters)
11. [Parâmetros opcionais / filtros: nunca normalizar para `{}`](#11-parâmetros-opcionais--filtros-nunca-normalizar-para-)
12. [Paginação por cursor (keyset)](#12-paginação-por-cursor-keyset)
13. [Repositórios e Mappers (Prisma)](#13-repositórios-e-mappers-prisma)
14. [Gateways (Queue / Storage)](#14-gateways-queue--storage)
15. [Variáveis de ambiente (`Env`)](#15-variáveis-de-ambiente-env)
16. [Domain Events](#16-domain-events)
17. [Logging](#17-logging)
18. [Testes](#18-testes)
19. [Lint, format e imports](#19-lint-format-e-imports)
20. [Convenções de nomenclatura](#20-convenções-de-nomenclatura)
21. [Checklist: como adicionar uma nova feature](#21-checklist-como-adicionar-uma-nova-feature)
22. [Documentação complementar já existente no repo](#22-documentação-complementar-já-existente-no-repo)
23. [Débito técnico conhecido](#23-débito-técnico-conhecido)

---

## 1. Stack e comandos

- **Runtime/Framework**: Node.js + NestJS 11 (Express).
- **Banco**: MongoDB via Prisma 6 (`generated/prisma` é o client gerado — não
  editar manualmente, nem versionar).
- **Validação**: Zod 4, integrado ao NestJS via `nestjs-zod` (DTOs, pipe de
  validação, documentação Swagger/Scalar gerada a partir dos schemas).
- **Mensageria/Storage externos**: AWS SQS e AWS S3 via `@aws-sdk/*`, rodando
  localmente contra **LocalStack** (`docker-compose.yml`).
- **Testes**: Vitest 4 (`globals: true`, `suite/describe/it`), com path
  aliases do `tsconfig.json` resolvidos via `vite-tsconfig-paths`.
- **Package manager**: pnpm (workspace de pacote único — ver
  `pnpm-workspace.yaml`).
- **Docs da API**: Scalar (`@scalar/nestjs-api-reference`), montado em
  `/docs`, com o OpenAPI gerado a partir dos schemas Zod.

Comandos principais (`package.json`):

```bash
pnpm install          # instala dependências
pnpm run dev          # nest start --watch
pnpm run build        # nest build
pnpm run prod         # node dist/src/infra/main (após build)

pnpm run test         # vitest run
pnpm run test:watch   # vitest (watch mode)
pnpm run test:cov     # vitest run --coverage

pnpm run lint         # eslint --fix
pnpm run format       # prettier --write

pnpm prisma generate  # regenera o client em generated/prisma
pnpm prisma db push   # sincroniza o schema com o MongoDB (sem migrations)
```

> ⚠️ `pnpm run test:e2e` existe no `package.json` mas aponta para
> `vitest.config.e2e.mjs`, que **não existe** no repo. Ver
> [Débito técnico](#23-débito-técnico-conhecido).

`docker-compose.yml` sobe um LocalStack com os serviços `sqs` e `s3`
(porta `4566`), usado pelos gateways de infraestrutura em desenvolvimento.

---

## 2. Regra de dependência entre camadas

```
┌─────────────────────────────────────────────────────────────┐
│  src/infra                                                   │
│  NestJS, Prisma, HTTP, AWS SDK (SQS/S3), filtros, Swagger     │
│                                                               │
│   depende de  ──────────────────────────────┐                │
└───────────────────────────────────────────┬─┼────────────────┘
                                              ▼ ▼
┌─────────────────────────────────────────────────────────────┐
│  src/domain/application                                      │
│  use cases, contratos de repositório/gateway/env, eventos     │
│                                                               │
│   depende de  ──────────────────────┐                        │
└────────────────────────────────────┬┼────────────────────────┘
                                      ▼▼
┌─────────────────────────────────────────────────────────────┐
│  src/domain/enterprise                                       │
│  entidades, value objects, regras de negócio intrínsecas      │
│                                                               │
│   depende de  ───────┐                                       │
└──────────────────────┼────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  src/core                                                     │
│  BaseEntity, AggregateRoot, ID, ValueObject, Either, tipos     │
│  utilitários — zero dependência de framework                  │
└─────────────────────────────────────────────────────────────┘
```

**Regra estrita**: `src/core` e `src/domain/*` **nunca** importam NestJS,
Prisma, Express, AWS SDK ou qualquer biblioteca de infraestrutura. Só
`src/infra` conhece esses detalhes. Isso é o que permite testar casos de uso
inteiros sem subir um `TestingModule` do Nest ou um banco — basta instanciar
a classe do use case com doubles em memória (ver [Testes](#18-testes)).

Sinais de que uma regra está na camada errada:

- Um `*.repository.ts` ou `*.mapper.ts` em `src/infra` decidindo uma regra de
  negócio (ex.: validar um valor) → a regra pertence à entidade/value object.
- Um controller fazendo cálculo ou validação de negócio → pertence ao use
  case ou à entidade.
- `import { PrismaClient }`, `import { Injectable } from '@nestjs/common'` ou
  `import { S3Client }` dentro de `src/domain` ou `src/core` → nunca.

---

## 3. Estrutura de pastas

```
src/
├── core/                         # building blocks sem dependência de framework
│   ├── consts/                   # mensagens de erro fixas (queue, storage)
│   ├── entities/                 # BaseEntity, AggregateRoot, ID, ValueObject
│   ├── errors/                   # interfaces EntityError / UseCaseError
│   ├── repositories/             # contratos genéricos (paginação, filtros)
│   └── types/                    # Either, Optional, OmitFromClass
│
├── domain/
│   ├── enterprise/
│   │   └── entities/              # Product, Category, value objects (Price)
│   │
│   └── application/
│       ├── <Feature>/             # Product/, Category/ — um por agregado
│       │   ├── errors/            # UseCaseError específicos da feature
│       │   ├── repositories/      # contrato abstrato (ex.: ProductsRepository)
│       │   └── use-cases/         # casos de uso + *.spec.ts ao lado
│       └── shared/
│           ├── env/                # CoreEnv (contrato agnóstico)
│           ├── events/             # DomainEvent, DomainEvents, EventHandler
│           └── gateways/           # Queue, Storage (contratos) + utils
│
└── infra/
    ├── app.module.ts              # registra filtros globais + HttpModule
    ├── main.ts                    # bootstrap
    ├── setup/                     # App (bootstrap orquestrado) + Swagger/Scalar
    ├── helpers/                   # prefixedLogger
    ├── logging/                   # AppLogger
    ├── http/
    │   ├── filters/                # 3 ExceptionFilters (ver seção 10)
    │   ├── pipes/                  # ZodValidationPipe
    │   └── modules/<Feature>/      # Create/Find/List/Update/Delete + types/
    └── shared/
        ├── database/
        │   └── prisma/              # PrismaService, repositories/, mappers/
        ├── env/                     # EnvService, env.schema (Zod), EnvModule
        └── gateways/
            ├── queue/                # AwsSqsQueueService, QueueConsumerService
            └── storage/              # AwsS3StorageService

test/
├── env/fake-env.ts
├── factories/make-<entity>.factory.ts   # faker (locale pt_BR)
├── gateways/{queue,storage}/fake-*.ts
└── repositories/in-memory-<feature>.repository.ts
```

Cada feature de domínio (`Product`, `Category`) é tratada como um **agregado
independente**: tem sua própria pasta de `errors/`, `repositories/` e
`use-cases/` em `domain/application`, e seu próprio módulo HTTP em
`infra/http/modules`. Não há uma pasta "genérica" de use cases — tudo é
escopado por feature.

---

## 4. `src/core` — building blocks compartilhados

### `BaseEntity` / `AggregateRoot` / `ID` / `ValueObject`

```ts
// src/core/entities/base-entity.ts
export abstract class BaseEntity<Props> {
  private _id: ID;
  protected props: Props;

  protected constructor(props: Props, id?: ID) {
    this.props = props;
    this._id = id ?? new ID(id);
  }

  public equals(entity: BaseEntity<unknown>) { /* ... */ }
}
```

- Toda entidade de domínio estende `BaseEntity<Props>` e expõe `props` via
  **getters** (nunca acessores públicos diretos de `props`).
- `AggregateRoot<Props>` estende `BaseEntity` e adiciona a fila de
  `domainEvents` + `addDomainEvent()` (ver [Domain Events](#16-domain-events)).
  Hoje nenhuma entidade concreta estende `AggregateRoot` diretamente — é a
  base preparada para quando uma entidade precisar disparar eventos.
- `ID` encapsula um `ObjectId` do MongoDB (via pacote `bson`), gera um novo
  automaticamente quando nenhum valor é passado, e expõe `isValid()` —
  **toda validação de "ID válido" no projeto passa por `new ID(value).isValid()`**,
  nunca por checagem manual de regex.
- `ValueObject<Props>` congela (`Object.freeze`) as props no construtor e
  implementa `equals()` por comparação estrutural (`JSON.stringify`).

### `Either<L, R>`

```ts
// src/core/types/either.ts
export type Either<L, R> = Left<L, R> | Right<L, R>;
```

Usado em **toda** fronteira de caso de uso e de gateway que pode falhar de
forma esperada. `Left` = erro, `Right` = sucesso. Nunca lançar `throw` para
sinalizar uma falha de regra de negócio dentro de um use case — devolver
`left(new AlgumErroDeNegocio())`. `throw` fica reservado para falhas
realmente excepcionais (ver [Tratamento de erros](#10-tratamento-de-erros-filters)).

Padrão de teste associado a `Either`:

```ts
expect(result.isRight()).toBeTruthy();
assert(result.isRight()); // o `assert` do Node faz o narrowing de tipo do TS
expect(result.value.product.title).toBe(...);
```

### `UseCaseError` / `EntityError`

Duas interfaces mínimas (`{ message: string }`) usadas apenas para marcar,
por `implements`, que uma classe de erro é um erro de domínio/aplicação —
não adicionam comportamento. Toda classe de erro de negócio segue o mesmo
molde:

```ts
export class InvalidProductIdError extends Error implements UseCaseError {
  constructor() {
    super('Invalid product id');
  }
}
```

- Erros de **entidade/value object** (ex.: preço negativo) implementam
  `EntityError` e moram junto da entidade (`.../entities/value-objects/errors/`).
- Erros de **caso de uso** (ex.: ID inválido, recurso já existe) implementam
  `UseCaseError` e moram em `.../<Feature>/errors/`.
- Mensagens recorrentes de infraestrutura (fila, storage) são centralizadas
  em `src/core/consts/*.consts.ts` (`QueueErrorMessagesConsts`,
  `StorageErrorMessagesConsts`) para não duplicar a string em cada erro.

### `Optional<T, K>` e `OmitFromClass<T, K>`

Utilitários de tipo para modelar "construtor de entidade" (`Optional`, ex.:
`createdAt` opcional em `Product.create`) e "DTO sem um campo da classe"
(`OmitFromClass`). Preferir esses dois helpers a reescrever `Pick`/`Omit`
ad-hoc.

### Contratos genéricos de repositório

`src/core/repositories/pagination-params.ts` define `PaginationParams`
(`cursor?`, `limit?`) e `PaginatedResult<T>` (`items`, `nextCursor`),
reutilizados por qualquer repositório paginado.

`src/core/repositories/product-filters.ts` é a **única fonte da verdade**
para os campos projetáveis de `Product` — a constante
`PRODUCT_FILTER_FIELDS` alimenta tanto o tipo `ProductFilters` quanto a
validação em runtime do `?fields=` na camada HTTP
(`product-fields-query.schema.ts`). Ao adicionar um campo projetável novo em
`Product`, atualizar essa constante é o único lugar necessário — tipo e
validação ficam sincronizados automaticamente.

---

## 5. `src/domain/enterprise` — entidades e regras de negócio

Entidades (`Product`, `Category`) e value objects (`Price`) vivem aqui.
Padrões:

- **Factory estática `create()`**, nunca `new Entity(...)` diretamente fora
  da própria classe/mappers:

  ```ts
  static create(props: Optional<ProductProps, 'createdAt'>, id?: ID) {
    return new Product({ ...props, createdAt: props.createdAt ?? new Date() }, id);
  }
  ```

- **Setters mutam e chamam `touch()`**, que atualiza `updatedAt`:

  ```ts
  public setTitle(title: string) {
    this.props.title = title;
    this.touch();
  }
  ```

  > `touch()` hoje soma **3 segundos** (`Date.now() + 3000`) em vez de usar
  > `new Date()` puro — é proposital (ver comentário no código: evita que
  > `createdAt === updatedAt` no mesmo milissegundo em cenários de teste), mas
  > é uma decisão não-óbvia à primeira leitura. Preservar esse comportamento
  > ao tocar em `Product`/`Category`, a menos que a mudança seja intencional.

- **Validação de regra de negócio pura fica no value object**, nunca no use
  case ou no repositório:

  ```ts
  // src/domain/enterprise/entities/value-objects/price.ts
  static createBRL(amount: number): Price {
    if (amount < 0) throw new NegativeAmountError();
    return new Price({ amount });
  }
  ```

  Note que aqui o value object usa `throw` (não `Either`) — é uma invariante
  de construção, não um fluxo esperado de "erro de negócio" de um use case.
  `NegativeAmountError` é capturada depois pelo `UseCaseErrorFilter`
  (`@Catch(Error)`) na camada HTTP.

- **`static isValidId(id: string)`** em cada entidade delega para
  `new ID(id).isValid()` — é o ponto de entrada usado pelos use cases para
  validar IDs recebidos como `string` antes de instanciar um `ID`.

---

## 6. `src/domain/application` — casos de uso, contratos e eventos

### Casos de uso

Um caso de uso é uma classe **pura** (sem decorators do Nest) com
construtor explícito recebendo os contratos de que precisa e um único
método público `execute(...)`:

```ts
export class CreateProductUseCase {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly queue: Queue,
    private readonly storage: Storage,
  ) {}

  public async execute(request: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    // 1. validações de entrada → left(...)
    // 2. checagens de regra de negócio contra o repositório → left(...)
    // 3. criação/mutação da entidade
    // 4. persistência
    // 5. efeitos colaterais (fila, storage, eventos de domínio)
    // 6. right({...})
  }
}
```

Convenções:

- `Request`/`Response` dos use cases são `interface`/`type` declarados **no
  próprio arquivo** do use case, não compartilhados entre use cases.
- O tipo de retorno é sempre `Promise<Either<ErroA | ErroB, SucessoShape>>`
  — a união de erros no `Left` é a lista explícita do que aquele use case
  pode devolver; ao adicionar uma nova falha tratada, adicionar o erro a
  essa união.
- Métodos privados auxiliares (ex.: `buildProductMessage`, `sendToQueue`)
  ficam na própria classe do use case, não extraídos para um util
  compartilhado, a menos que mais de um use case precise do mesmo
  comportamento — nesse caso, use `GatewayUtils` (ver abaixo).

### Contratos de repositório

Cada feature define seu contrato como `abstract class` (não `interface`) em
`.../repositories/<feature>.repository.ts` — `abstract class` é usada (e
não `interface`) porque o NestJS a usa como *injection token* em
`useClass` (ver seção 13):

```ts
export abstract class ProductsRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findManyPartial(pagination: PaginationParams, filters?: ProductFilters): Promise<PaginatedResult<Partial<Product>>>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findByIdPartial(id: string, filters: ProductFilters): Promise<Partial<Product> | null>;
  abstract findByTitle(title: string): Promise<Product | null>;
  abstract create(product: Product): Promise<Product>;
  abstract update(product: Product, changes: ProductUpdateData): Promise<void>;
  abstract delete(productId: string): Promise<void>;
}
```

`update(entity, changes)` recebe **dois** parâmetros por design: `entity` é
a entidade já mutada em memória (usada para montar a resposta e para o novo
`updatedAt`), `changes` é só o subconjunto de campos que veio no `PATCH` —
para que a implementação Prisma grave apenas o que mudou, em vez de
reescrever todas as colunas com o snapshot atual. Qualquer novo
`update`/`PATCH` em uma feature nova deve seguir essa mesma assinatura de
dois parâmetros.

### Gateways (`Queue`, `Storage`) e `GatewayUtils`

Contratos agnósticos de infraestrutura de mensageria/armazenamento, vistos
em detalhe na [seção 14](#14-gateways-queue--storage). `GatewayUtils`
(`shared/gateways/utils/gateway.utils.ts`) centraliza a serialização de
`Product`/`Category` para mensagem de fila/storage, reaproveitada por
`UpdateProductUseCase` e pelos use cases de `Category` — `CreateProductUseCase`
e `DeleteProductByIdUseCase`, porém, montam a mensagem com um método privado
próprio (`buildProductMessage`) em vez de usar `GatewayUtils`. Ao escrever um
use case novo que precise enviar `Product`/`Category` para fila/storage,
preferir `GatewayUtils` em vez de duplicar o `JSON.stringify` manual.

### `CoreEnv<T>` (abstração de env)

```ts
// src/domain/application/shared/env/env.ts
export abstract class CoreEnv<T> {
  abstract get<K extends keyof T>(key: K): T[K];
}
```

Permite que gateways de infra (ex.: `AwsS3StorageService`) dependam de uma
abstração de configuração sem conhecer `@nestjs/config` — ver
[seção 15](#15-variáveis-de-ambiente-env).

### Domain Events

Infraestrutura pronta (`DomainEvent`, `DomainEvents`, `EventHandler`) para
disparo de eventos de domínio após persistência — ver
[seção 16](#16-domain-events). Hoje só é efetivamente usada em
`CreateProductUseCase`, que chama
`DomainEvents.dispatchEventsForAggregate(newProduct.id)` ao final — mesmo
sem nenhum handler registrado ainda (`Product` não dispara eventos próprios
por não estender `AggregateRoot`).

---

## 7. Padrão Service = Use Case + NestJS

Cada caso de uso tem um "Service" correspondente em
`infra/http/modules/<Feature>/<Ação>/*.service.ts`, cuja única
responsabilidade é dar ao use case um construtor compatível com o DI do
Nest:

```ts
// src/infra/http/modules/Product/Create/create-product.service.ts
@Injectable()
export class CreateProductService extends CreateProductUseCase {
  constructor(productsRepository: ProductsRepository, queue: Queue, storage: Storage) {
    super(productsRepository, queue, storage);
  }
}
```

Por que não decorar o próprio `CreateProductUseCase` com `@Injectable()`?
Porque isso acoplaria o domínio ao NestJS — a regra de dependência
([seção 2](#2-regra-de-dependência-entre-camadas)) proíbe qualquer import de
`@nestjs/common` dentro de `src/domain`. O `Service` em `src/infra` é o
único lugar onde essa ponte acontece: ele **não reimplementa** lógica, só
repassa as dependências para `super(...)`. Ao criar uma feature nova, o
`Service` é sempre esse mesmo boilerplate de "estende o use case, injeta via
construtor, chama `super`" — nunca adicionar lógica de negócio no `Service`.

Os parâmetros do construtor do `Service` (ex.: `productsRepository: ProductsRepository`)
são resolvidos pelo Nest a partir dos providers registrados no
`DatabaseModule`/`QueueModule`/`StorageModule` (ver seção 13 e 14), usando o
`abstract class` do contrato como *injection token*.

---

## 8. Estrutura de uma feature HTTP

```
src/infra/http/modules/<Feature>/
├── Create/
│   ├── create-<feature>.controller.ts
│   └── create-<feature>.service.ts
├── Find/
│   ├── find-<feature>.controller.ts
│   └── find-<feature>.service.ts
├── List/                      # só em features com listagem (hoje: Product)
├── Update/
├── Delete/
├── <feature>.module.ts
└── types/
    ├── <feature>.dto.ts               # classes DTO (createZodDto), reexportadas
    ├── create-<feature>.schema.ts     # z.object request + response
    ├── update-<feature>.schema.ts
    ├── find-<feature>.schema.ts
    └── delete-<feature>.schema.ts
```

Regras:

- **Uma pasta por ação CRUD** (`Create/`, `Find/`, `List/`, `Update/`,
  `Delete/`), cada uma com exatamente um `controller` + um `service`. Não
  agrupar múltiplas ações em um único controller.
- O **controller é um adaptador fino**: valida entrada via pipe Zod, chama
  `this.xxxService.execute(...)`, checa `result.isLeft()` → `throw result.value`
  (delegando o mapeamento HTTP para os filters — seção 10), e monta o corpo
  de resposta manualmente a partir da entidade de domínio.

  ```ts
  @Post()
  async handle(@Body(new ZodValidationPipe(createProductSchema)) body: CreateProductDTO) {
    const result = await this.createProductService.execute({ ...body });
    if (result.isLeft()) throw result.value;

    return {
      product: {
        id: result.value.product.id.toString(),
        title: result.value.product.title,
        // ...serialização manual campo a campo
      },
    };
  }
  ```

  > Essa serialização manual é repetida em todo controller — há um `// TODO:
  > Colocar em um presenter` deixado no código em vários pontos. Um
  > `Presenter`/`ProductViewModel` central é a extração natural se esse
  > padrão crescer; até lá, seguir o mesmo bloco de serialização campo a
  > campo usado nos controllers existentes para manter consistência.

- O `module.ts` da feature importa `DatabaseModule` (+ `QueueModule`/
  `StorageModule` quando o use case precisa) e registra todos os
  controllers/services da pasta.
- `types/*.schema.ts` concentra **Zod schemas de request e response** lado a
  lado no mesmo arquivo (ex.: `createProductSchema` e
  `createProductResponseSchema` em `create-product.schema.ts`). `types/<feature>.dto.ts`
  apenas reexporta cada schema como uma classe DTO via `createZodDto` — é o
  que o NestJS/Swagger de fato consome nos decorators.
- Query strings compartilhadas entre rotas (ex.: `?fields=`) são extraídas
  para um schema próprio reutilizado pelos dois (`product-fields-query.schema.ts`,
  usado por `find-product.schema.ts` e `find-products.schema.ts`) — nunca
  duplicar a mesma validação de query em dois arquivos.

---

## 9. Validação com Zod (`nestjs-zod`)

- Todo input HTTP (body, params, query) é validado por um `z.object(...)`
  passado ao `ZodValidationPipe` (`src/infra/http/pipes/zod-validation.pipe.ts`)
  via decorator (`@Body(new ZodValidationPipe(schema))`,
  `@Param(new ZodValidationPipe(schema))`, `@Query(...)`). O pipe converte
  `ZodError` em `BadRequestException` com uma lista de `errors` formatada
  como `"<path>: <message>"`.
- IDs em schemas usam sempre o mesmo `refine`:
  `z.string().refine((v) => new ID(v).isValid(), { error: 'Invalid ID' })`
  — nunca uma regex de ObjectId manual.
- Schemas de **response** existem mesmo não sendo usados para validar saída
  em runtime — servem para o decorator `@ZodResponse({ type: XxxResponseDTO, status })`
  gerar a documentação OpenAPI/Scalar corretamente. Ao adicionar uma rota
  nova, sempre declarar o schema de response e o `@ZodResponse(...)`
  correspondente.
- `PATCH` (update) usa `.refine((data) => Object.values(data).some((v) => v !== undefined), ...)`
  no schema inteiro para rejeitar um body vazio — todo schema de update novo
  deve ter esse mesmo guard, senão uma requisição `PATCH {}` passa na
  validação sem atualizar nada.
- `limit` de paginação usa `z.coerce.number().int().positive().max(MAX_LIMIT).optional().default(DEFAULT_LIMIT)`
  — `DEFAULT_LIMIT`/`MAX_LIMIT` são constantes locais ao schema (hoje
  duplicadas entre `find-products.schema.ts` e
  `prisma-products.repository.ts`; manter os dois valores em sincronia ao
  alterá-los).

---

## 10. Tratamento de erros (filters)

Três `ExceptionFilter`s globais, registrados em `app.module.ts` via
`APP_FILTER` **nesta ordem** (o Nest aplica em ordem reversa de registro —
o último registrado é o primeiro a tentar tratar a exceção, então
`UseCaseErrorFilter`, por ser o mais genérico (`@Catch(Error)`), precisa
continuar sendo o último item da lista para servir de fallback):

1. **`EnvValidationExceptionFilter`** (`@Catch(EnvValidationError)`) — trata
   falha de validação do `.env` (ver seção 15), formatando um 400 com os
   campos inválidos.
2. **`GlobalHttpExceptionFilter`** (`@Catch(HttpException)`) — captura
   qualquer `HttpException` "crua" do Nest (ex.: `BadRequestException` vindo
   do `ZodValidationPipe`) e padroniza o corpo de resposta
   (`statusCode`, `message`, `errors`, `timestamp`), além de logar via
   `AppLogger`.
3. **`UseCaseErrorFilter`** (`@Catch(Error)`) — é quem trata os erros de
   domínio/use case lançados pelos controllers (`throw result.value`). Mantém
   um `Map<string, HttpStatus>` (`mapErrorToStatusCode`) de **nome da
   classe de erro → status HTTP**:

   ```ts
   private mapErrorToStatusCode = new Map<string, HttpStatus>([
     [CategoryAlreadyExistsError.name, HttpStatus.BAD_REQUEST],
     [InvalidProductIdError.name, HttpStatus.BAD_REQUEST],
     [ProductAlreadyExistsError.name, HttpStatus.UNPROCESSABLE_ENTITY],
     [SendToQueueError.name, HttpStatus.SERVICE_UNAVAILABLE],
     // ...
   ]);
   ```

   Um erro **não registrado** nesse mapa cai no `HttpStatus.INTERNAL_SERVER_ERROR`
   por padrão.

**Regra obrigatória**: toda classe de `UseCaseError`/`EntityError` nova
precisa ser adicionada a esse `Map` em `use-case-error.filter.ts`, com o
status HTTP correto — senão o erro vira silenciosamente um 500. Isso é fácil
de esquecer porque o `throw result.value` no controller compila
normalmente mesmo sem a entrada no mapa.

---

## 11. Parâmetros opcionais / filtros: nunca normalizar para `{}`

> Convenção original deste arquivo, mantida sem alterações — encontrada ao
> implementar paginação por cursor em `findManyPartial`, 22/10/2026.

Quando um parâmetro é opcional e representa "filtro"/"seleção de campos"
(ex.: `ProductFilters`), ele deve permanecer `T | undefined` em toda a
cadeia de chamadas — use case, repositório (contrato abstrato) e
implementações (`PrismaXRepository`, `InMemoryXRepository`).

**Não faça** isso no use case para "simplificar" a chamada ao repositório:

```typescript
// errado — {} é sempre truthy, então `if (filters)` no repositório nunca
// diferencia "sem filtro" de "filtro vazio"
await this.productsRepository.findManyPartial({ cursor, limit }, filters ?? {});
```

Objetos JS são sempre truthy, tenham ou não chaves. Normalizar
`undefined` para `{}` antes de repassar quebra qualquer `if (filters)` do
lado de quem recebe — o branch de "filtro presente" passa a ser escolhido
sempre, mesmo sem filtro nenhum.

**Faça**: mantenha `filters?: ProductFilters` opcional em toda a cadeia e
deixe `undefined` fluir até onde a decisão é tomada:

```typescript
// use case
await this.productsRepository.findManyPartial({ cursor, limit }, filters);

// contrato do repositório
abstract findManyPartial(
  params: PaginationParams,
  filters?: ProductFilters,
): Promise<PaginatedResult<Product | Partial<Product>>>;

// implementação — if (filters) agora significa de fato "há filtro"
if (filters) { /* projeção parcial */ }
```

Esse é o padrão já usado em `findByIdPartial` / `FindProductByIdUseCase` /
`find-product.schema.ts` — qualquer novo fluxo com filtro opcional deve
seguir a mesma convenção, por consistência.

---

## 12. Paginação por cursor (keyset)

`GET /products` (e `findManyPartial` no repositório) usa **paginação por
cursor** (keyset pagination), não `offset`/`page`:

- `cursor` é o `id` do último item da página anterior; omitido, busca a
  primeira página.
- `limit` tem default `20` e máximo `100` (`DEFAULT_LIMIT`/`MAX_LIMIT`,
  duplicados no schema Zod e no repositório Prisma — ver seção 9).
- A implementação Prisma busca `take + 1` registros; se vier o item extra,
  ele é cortado do resultado e seu `id` vira o `nextCursor` — evita uma
  segunda query (`count`) só para saber se há próxima página:

  ```ts
  const baseArgs: Prisma.ProductFindManyArgs = { take: take + 1, orderBy: { id: 'asc' } };
  if (cursor) { baseArgs.cursor = { id: cursor }; baseArgs.skip = 1; }

  const hasNextPage = rows.length > take;
  const page = hasNextPage ? rows.slice(0, -1) : rows;
  return { items: page.map(toDomain), nextCursor: hasNextPage ? page[page.length - 1].id : null };
  ```

  O double `InMemoryProductsRepository` reimplementa a mesma semântica
  ordenando por `id.toValue()` (lexicográfico — equivalente à ordem
  cronológica de um `ObjectId`) e localizando o índice do `cursor` via
  `findIndex`, lançando `Error` se o cursor não for encontrado (capturado
  pelo use case e convertido em `left(new InvalidPaginationCursorError())`).
- `cursor` é tipado como **opaco**: qualquer ID válido de `Product`, não uma
  estrutura própria de paginação — o schema Zod só garante
  `new ID(value).isValid()`.

Ao paginar uma feature nova por cursor, seguir exatamente esse contrato
(`PaginationParams`/`PaginatedResult` de `src/core/repositories/pagination-params.ts`)
em vez de inventar um formato de paginação diferente.

---

## 13. Repositórios e Mappers (Prisma)

- O contrato abstrato (`abstract class`) vive em
  `domain/application/<Feature>/repositories/`. A implementação concreta
  vive em `infra/shared/database/prisma/repositories/Prisma<Feature>Repository`,
  e é conectada ao contrato via provider no `DatabaseModule`:

  ```ts
  @Module({
    providers: [
      PrismaService,
      { provide: ProductsRepository, useClass: PrismaProductsRepository },
      { provide: CategoriesRepository, useClass: PrismaCategoriesRepository },
    ],
    exports: [PrismaService, CategoriesRepository, ProductsRepository],
  })
  export class DatabaseModule {}
  ```

  Isso é o que permite que um use case dependa só de `ProductsRepository`
  (o contrato) e o Nest injete `PrismaProductsRepository` em runtime, e um
  `InMemoryProductsRepository` em teste — sem nenhum dos dois conhecer o
  outro.

- Toda tradução entre o schema Prisma e as entidades de domínio passa por um
  **Mapper** estático (`PrismaProductsMapper`, `PrismaCategoriesMapper`),
  nunca inline no repositório:
  - `toDomain(raw)` → entidade completa (`Product`/`Category`).
  - `toDomainPartial(raw)` → `Partial<Entity> & { id: ID }`, usado quando a
    query Prisma usou `select` (projeção parcial via `ProductFilters`). Como
    os getters de `Product` não têm setter correspondente, o objeto parcial é
    sempre montado em **uma única expressão** com spreads condicionais
    (`...(raw.title !== undefined && { title: raw.title })`), nunca por
    atribuição após a criação.
  - `toPrisma(entity)` → `Prisma.XUncheckedCreateInput`, usado em `create`.
- `update(entity, changes)` monta o `data` do Prisma **só com os campos
  presentes em `changes`** (spread condicional por campo) + `updatedAt` da
  entidade — nunca reescreve o registro inteiro a partir do snapshot da
  entidade. `id` nunca entra em `data` (só em `where`): o Prisma rejeita
  `id` como campo de update (`"Unknown argument id"`).
- Filtros de campo (`ProductFilters`) viram um `Prisma.XSelect` através de um
  método privado `buildSelect(filters)` no repositório — `id: true` é
  sempre forçado nesse select, independente do que veio em `filters`, pois é
  necessário para reidentificar a entidade.
- `category` no domínio é representado como `ID` (não como objeto
  aninhado); por isso `buildSelect` mapeia `filters.category` para o campo
  escalar `categoryId` do Prisma, nunca para a relação `category`.
- `PrismaService` estende `PrismaClient`, expõe eventos de log (`query`,
  `info`, `warn`, `error`) via `$on` (desativados em produção —
  `NODE_ENV === 'prod'`), e faz um `$runCommandRaw({ ping: 1 })` com timeout
  de 5s no `onModuleInit`, derrubando o processo (`process.exit(1)`) se o
  banco não responder.
- O client gerado do Prisma fica em `generated/prisma` (configurado em
  `prisma/schema.prisma`, `generator client { output = "../generated/prisma" }`)
  e é importado via o path alias `@generated/*` (ou `@/../generated/*`,
  usado de forma inconsistente entre arquivos — ver
  [Débito técnico](#23-débito-técnico-conhecido)). **Nunca editar** arquivos
  dentro de `generated/`; rodar `pnpm prisma generate` após alterar
  `prisma/schema.prisma`.

---

## 14. Gateways (Queue / Storage)

Mesmo padrão de contrato abstrato + implementação dos repositórios, aplicado
a mensageria e armazenamento:

```ts
// contrato — src/domain/application/shared/gateways/queue.gateway.ts
export abstract class Queue {
  abstract produce(queueName: string, message: string): Promise<Either<SendToQueueError, {...}>>;
  abstract consume(queueName: string): Promise<Either<ConsumingFromQueueError, string>>;
}
```

- **`AwsSqsQueueService`** (`infra/shared/gateways/queue/`) implementa
  `Queue` sobre `@aws-sdk/client-sqs`. `ensureQueueExists` resolve
  nome-ou-URL de fila, tentando `GetQueueUrlCommand` e criando a fila via
  `CreateQueueCommand` se não existir, com backoff exponencial (até 5
  tentativas) e um cache local (`failedQueueCache`) para não martelar filas
  que já falharam.
- **`QueueConsumerService`** (`OnModuleInit`/`OnModuleDestroy`) inicia um
  loop de consumo em background ao subir o módulo. Hoje ele **para após
  consumir a primeira mensagem** (`this.isConsuming = false` dentro do loop)
  — revisar essa lógica antes de depender dele para consumo contínuo em
  produção.
- **`AwsS3StorageService`** (`infra/shared/gateways/storage/`) implementa
  `Storage` sobre `@aws-sdk/client-s3`, com `ensureBucketExists` (tenta
  `HeadBucketCommand`, cria via `CreateBucketCommand` se ausente) antes de
  `save`.

  > ⚠️ Ver [Débito técnico](#23-débito-técnico-conhecido): este serviço hoje
  > lê `DATABASE_URL` (em vez de `AWS_S3_ENDPOINT`/`AWS_REGION`) para
  > `region`/`endpoint`, e usa credenciais fake hardcoded em vez de
  > `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`.

- Ambos os módulos (`QueueModule`, `StorageModule`) seguem o mesmo molde do
  `DatabaseModule`: `{ provide: Queue, useClass: AwsSqsQueueService }` /
  `{ provide: Storage, useClass: AwsS3StorageService }`.
- Em teste, **nunca** instanciar os serviços AWS reais — usar sempre
  `FakeQueue`/`FakeStorage` de `test/gateways/`, que simulam o comportamento
  em memória (`Map<string, Message[]>`) com a mesma interface `Either`.

---

## 15. Variáveis de ambiente (`Env`)

Três camadas, como em qualquer outro contrato deste projeto:

1. **`CoreEnv<T>`** (domain, agnóstico) — `abstract get<K extends keyof T>(key: K): T[K]`.
2. **`envSchema`** (`infra/shared/env/env.schema.ts`) — valida todas as
   variáveis via Zod (`NODE_ENV`, `APP_PORT`, `BASE_URL`, `DATABASE_URL`,
   `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
   `AWS_SQS_ENDPOINT`, `AWS_QUEUE_TOPIC`, `AWS_S3_BUCKET`,
   `AWS_S3_ENDPOINT`). `validateEnv(config)` é passado como `validate` para
   `ConfigModule.forRoot(...)` — uma falha de validação lança
   `EnvValidationError` (capturada pelo `EnvValidationExceptionFilter`, seção
   10) **antes mesmo da aplicação subir**.
3. **`EnvService`** (`infra/shared/env/env.service.ts`) implementa
   `CoreEnv<Env>` por cima do `ConfigService<Env, true>` do Nest — é o que
   de fato é injetado em gateways e no `PrismaService`.

Ao adicionar uma variável de ambiente nova: declarar em `envSchema`
primeiro (com o tipo/validação Zod correto), depois consumi-la via
`envService.get('NOME_DA_VAR')` — nunca `process.env.NOME_DA_VAR` direto em
código de `src/infra`, e nunca em `src/domain`/`src/core`.

Em teste, usar `FakeEnv` (`test/env/fake-env.ts`) — note que seu shape
(`region`, `endpoint`, `queueName`, `credentials`) é diferente do `Env` real
usado em produção; é um double específico para testes que exercitam
gateways isoladamente.

---

## 16. Domain Events

Infraestrutura simples de pub/sub síncrono, para desacoplar efeitos
colaterais da lógica central de um caso de uso:

```ts
// src/domain/application/shared/events/domain-events.ts
export class DomainEvents {
  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) { ... }
  public static dispatchEventsForAggregate(id: ID) { ... }
  public static register(callback: DomainEventCallback, eventClassName: string) { ... }
}
```

- `AggregateRoot.addDomainEvent(event)` empilha o evento na entidade e
  marca o agregado para despacho (`DomainEvents.markAggregateForDispatch`).
- O use case, **após persistir** a entidade com sucesso, chama
  `DomainEvents.dispatchEventsForAggregate(entity.id)` — isso dispara todos
  os handlers registrados para cada evento daquele agregado e limpa a fila.
- Handlers se registram via `DomainEvents.register(callback, EventoClassName)`
  — tipicamente no `onModuleInit` de um `EventHandler` (interface marker em
  `shared/events/event-handler.ts`).
- `DomainEvents.shouldRun` é um kill-switch estático (útil para desligar
  disparo de eventos em testes que não querem efeitos colaterais) e
  `clearHandlers()`/`clearMarkedAggregates()` resetam o estado estático
  entre suites de teste.

Hoje só `CreateProductUseCase` chama `dispatchEventsForAggregate`, sem
nenhum evento/handler concreto registrado — é a base pronta para o próximo
evento de domínio real (ex.: `ProductCreatedEvent` disparando uma
notificação). Ao adicionar um evento novo: criar a classe implementando
`DomainEvent` (`ocurredAt`, `getAggregateId()`), chamar
`entity.addDomainEvent(new XEvent(...))` dentro da entidade (não do use
case) no ponto em que a mudança de estado acontece, e registrar o handler
correspondente via `DomainEvents.register`.

---

## 17. Logging

- **`AppLogger`** (`infra/logging/app-logger.service.ts`) estende o
  `Logger` do Nest e padroniza três métodos: `logError`, `logException`
  (alias de `logError`) e `logWarning`. Normaliza qualquer `unknown`
  lançado (instância de `Error`, `string`, objeto solto) em um
  `MonitorErrorPayload` consistente antes de formatar a linha de log.
  É injetado via `AppLogger` (não `Logger` puro) nos filters HTTP (seção
  10) — usar sempre `AppLogger.logError(...)` ao logar uma exceção
  capturada em um filter novo, para manter o formato consistente
  (`name=... message=... statusCode=... metadata=...`).
- **`prefixedLogger(prefix, context?)`** (`infra/helpers/prefixed-logger.ts`)
  retorna um `Logger` do Nest com o prefixo em maiúsculas
  (`new Logger('PROD][CONTEXT')` quando há contexto) — usado pelo
  `PrismaService` (prefixo = `NODE_ENV`) e pelo `App`/bootstrap. Preferir
  esse helper a instanciar `new Logger(...)` cru quando o log precisa
  deixar claro o ambiente/módulo de origem.
- Fora dos filters/serviços acima, há `console.log`/`console.error`
  pontuais em código de infraestrutura mais antigo (gateways AWS, doubles de
  teste) — não é o padrão a seguir em código novo; usar `AppLogger` ou um
  `Logger` do Nest nomeado pela classe.

---

## 18. Testes

Stack: **Vitest**, `globals: true` (sem precisar importar `describe`/`it`/`expect`),
path aliases resolvidos (`vite-tsconfig-paths`) — então testes importam de
`@/...` (código-fonte) e de `test/...` (doubles/factories) por caminho
absoluto a partir da raiz do projeto, não por caminho relativo.

### Localização

Testes de use case/entidade ficam **ao lado do arquivo testado**
(`create-product-use-case.ts` + `create-product-use-case.spec.ts` na mesma
pasta), nunca em uma árvore `__tests__/` separada.

### Estrutura padrão de um `*.spec.ts`

```ts
let productsRepository: InMemoryProductsRepository;
let queue: FakeQueue;
let storage: FakeStorage;
/**
 * System Under Test (SUT)
 */
let sut: CreateProductUseCase;

suite('[Product][UseCase]', () => {
  // IMPORTANT: beforeEach depois de suite() — evita memory leak/cleanup
  // issues que ocorreriam se estivesse dentro de um describe() aninhado.
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    queue = new FakeQueue();
    storage = new FakeStorage();
    sut = new CreateProductUseCase(productsRepository, queue, storage);
  });

  describe('Create Product', () => {
    it('should be able to create a new Product', async () => { /* ... */ });
    it('should throw error creating Category with ivalid ownerId', async () => { /* ... */ });
  });
});
```

- Tag raiz `suite('[Feature][UseCase]', () => { ... })` identifica a
  feature e a camada; `describe(...)` dentro agrupa por caso de uso/cenário.
- Nomes de teste seguem `should be able to ...` (caminho feliz) e
  `should throw error ...` / `should return ...` (caminhos de erro) — mesmo
  quando o use case não lança (`throw`) e sim devolve `left(...)`.
- `let sut: <UseCase>` é sempre comentado como **System Under Test** — manter
  esse comentário em specs novos, é a convenção do projeto para identificar
  rapidamente a classe testada em arquivos com múltiplos doubles.
- Nenhum `TestingModule` do Nest é usado nos testes de use case — o `sut` é
  instanciado com `new` passando os doubles diretamente, exatamente como o
  `Service` do Nest faria em runtime.

### Doubles

- **Repositórios**: `InMemoryXRepository` em `test/repositories/`,
  guardando entidades em `Map<string, Entity>` (chave = `id.toString()`),
  implementando o mesmo contrato abstrato (`ProductsRepository`) usado pela
  implementação Prisma — incluindo a mesma semântica de paginação por cursor
  e projeção parcial (`findManyPartial`, `findByIdPartial`) descritas nas
  seções 12 e 13.
- **Gateways**: `FakeQueue`/`FakeStorage` em `test/gateways/`, guardando
  mensagens em `Map` e retornando sempre `Either` compatível com o contrato
  real.
- **Env**: `FakeEnv` em `test/env/`.
- **Factories**: `makeProductFactory(props?, id?)` / `makeCategoryFactory(props?, id?)`
  em `test/factories/`, usando `@faker-js/faker/locale/pt_BR` para gerar
  dados plausíveis em português, com todos os campos opcionais e
  sobrescrevíveis via `props`. Usar sempre a factory em vez de montar a
  entidade manualmente em um teste novo.

### Convenções de asserção

- Resultado de use case: `expect(result.isRight()/.isLeft()).toBeTruthy()`
  seguido de `assert(result.isRight())`/`assert(result.isLeft())` (o
  `assert` global do Node, não do Vitest) para o TypeScript fazer o
  *narrowing* de `Either` antes de acessar `result.value`.
- Preferir **doubles em memória reais** a `vi.mock`/mocks de comportamento —
  `vi.spyOn` é usado pontualmente para simular uma falha específica de um
  gateway (ex.: `vi.spyOn(queue, 'produce').mockImplementationOnce(() => { throw ... })`),
  não para substituir toda a dependência.
- Validar o **estado final real** do repositório em memória
  (`expect(productsRepository.items).toHaveLength(1)`), não apenas o
  retorno do use case.

---

## 19. Lint, format e imports

- **ESLint** (`eslint.config.mjs`, flat config): `@eslint/js` recommended +
  `typescript-eslint` `recommendedTypeChecked` + `eslint-plugin-prettier`
  recommended. Regras customizadas relevantes:
  - `max-len`: 110 colunas (comentários, URLs e linhas de `import` isentos).
  - `simple-import-sort/imports`: **error** — ordenação automática de
    imports é obrigatória (ver padrão de grupos abaixo).
  - `import/newline-after-import`: **error**.
  - `@typescript-eslint/no-unused-vars`: variáveis/args/erros capturados
    prefixados com `_` são ignorados (`_changes`, `_err`).
  - `@typescript-eslint/no-explicit-any`: desligada — `any` é permitido
    quando necessário (usado em alguns filters/catch blocks).
- **Prettier** (`.prettierrc`): aspas simples, vírgula final sempre
  (`trailingComma: all`), `printWidth: 110`.
- **Ordenação de imports** (`simple-import-sort`), observada em todo o
  código existente — seguir essa ordem ao adicionar imports manualmente:
  1. pacotes externos (`@nestjs/*`, `zod`, bibliotecas npm);
  2. imports de teste por caminho absoluto (`test/factories/...`,
     `test/repositories/...`) quando o arquivo é um `*.spec.ts`;
  3. imports internos por alias `@/...`, dos mais genéricos
     (`@/core/...`) aos mais específicos (`@/domain/...`, `@/infra/...`);
  4. imports relativos (`./`, `../`) do próprio módulo/feature, por último.

  Uma linha em branco separa cada grupo — o plugin de lint corrige isso
  automaticamente com `pnpm run lint`.
- **Path aliases** (`tsconfig.json`): `@/*` → `./src/*`, `@generated/*` →
  `./generated/*`. Usar sempre o alias `@/...` em vez de caminho relativo
  longo (`../../../core/...`) para qualquer import fora da própria
  feature/pasta.

---

## 20. Convenções de nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Variáveis, métodos, funções | `camelCase` | `findManyPartial`, `ownerId` |
| Classes, interfaces, types | `PascalCase` | `CreateProductUseCase`, `ProductFilters` |
| Arquivos | `kebab-case` | `create-product-use-case.ts` |
| Caso de uso | `<Ação><Entidade>UseCase`, arquivo `<ação>-<entidade>-use-case.ts` | `FindProductByIdUseCase` |
| Serviço NestJS (wrapper do use case) | `<Ação><Entidade>Service`, arquivo `<ação>-<entidade>.service.ts` | `CreateProductService` |
| Controller | `<Ação><Entidade>[ById]Controller`, arquivo `<ação>-<entidade>.controller.ts` | `FindProductByIdController` |
| Erro de domínio/use case | `<Motivo>Error`, implementa `UseCaseError`/`EntityError` | `InvalidProductIdError` |
| Contrato de repositório | `<Entidades>Repository` (abstract class) | `ProductsRepository` |
| Implementação Prisma | `Prisma<Entidades>Repository` | `PrismaProductsRepository` |
| Double em memória | `InMemory<Entidades>Repository` | `InMemoryProductsRepository` |
| Mapper | `Prisma<Entidades>Mapper` | `PrismaProductsMapper` |
| Gateway (contrato) | substantivo simples (abstract class) | `Queue`, `Storage` |
| Gateway (implementação) | `<Provedor><Gateway>Service` | `AwsSqsQueueService` |
| Gateway (fake) | `Fake<Gateway>` | `FakeQueue`, `FakeStorage` |
| Schema Zod | `<ação><entidade>Schema` / `...ResponseSchema`, arquivo `<ação>-<entidade>.schema.ts` | `createProductSchema` |
| DTO | `<Ação><Entidade>DTO` / `...ResponseDTO` | `CreateProductDTO` |
| Factory de teste | `make<Entidade>Factory` | `makeProductFactory` |
| Teste | `*.spec.ts`, ao lado do arquivo testado | `create-product-use-case.spec.ts` |

Módulos HTTP por feature usam **PascalCase** na pasta (`Product/`,
`Category/`, e subpastas de ação `Create/`, `Find/`, `List/`, `Update/`,
`Delete/`) — é a única exceção consciente a "pastas em kebab-case"; os
arquivos dentro dessas pastas continuam em kebab-case normalmente.

---

## 21. Checklist: como adicionar uma nova feature

Para um novo agregado `Foo` com CRUD completo:

1. **Domínio (`src/domain/enterprise`)**: criar a entidade `Foo extends BaseEntity<FooProps>`
   com `create()` estático, getters, `setX()`+`touch()` para cada campo
   mutável, `static isValidId()`. Value objects próprios de `Foo`, se
   houver, com sua própria validação via `throw` + `EntityError`.
2. **Contrato de repositório** (`domain/application/Foo/repositories/foos.repository.ts`):
   `abstract class FoosRepository` com os métodos necessários; se houver
   `update`, assinatura `update(foo: Foo, changes: FooUpdateData): Promise<void>`.
3. **Erros** (`domain/application/Foo/errors/*.error.ts`): um arquivo por
   erro, `extends Error implements UseCaseError`.
4. **Casos de uso** (`domain/application/Foo/use-cases/*.ts` + `*.spec.ts`
   lado a lado): um por ação, `Request`/`Response` locais ao arquivo,
   retorno `Either<ErroA | ErroB, Sucesso>`.
5. **Repositório Prisma**: adicionar o `model Foo` em `prisma/schema.prisma`,
   rodar `pnpm prisma generate`, criar `PrismaFoosMapper`
   (`toDomain`/`toDomainPartial`/`toPrisma`) e `PrismaFoosRepository`
   implementando o contrato; registrar `{ provide: FoosRepository, useClass: PrismaFoosRepository }`
   no `DatabaseModule`.
6. **Double de teste**: `InMemoryFoosRepository` em `test/repositories/`,
   mesma semântica do contrato; `makeFooFactory` em `test/factories/`.
7. **Módulo HTTP** (`infra/http/modules/Foo/`): uma pasta por ação
   (`Create/`, `Find/`, `List/`, `Update/`, `Delete/`), cada uma com
   `controller` + `service` (`service extends XUseCase`); `types/` com
   schemas Zod de request/response + `foo.dto.ts` reexportando como
   `createZodDto`; `foo.module.ts` importando `DatabaseModule` (+
   `QueueModule`/`StorageModule` se o use case precisar) e registrando
   controllers/services.
8. **Registrar o módulo** em `HttpModule` (`infra/http/http.module.ts`).
9. **Erros → status HTTP**: adicionar toda `UseCaseError`/`EntityError` nova
   ao `mapErrorToStatusCode` de `UseCaseErrorFilter` (seção 10) — passo
   fácil de esquecer e sem erro de compilação se pulado.
10. **Testes**: specs dos use cases (seção 18), rodar `pnpm run test` e
    `pnpm run lint` antes de considerar a feature pronta.

---

## 22. Documentação complementar já existente no repo

Este `CLAUDE.md` é a referência principal, mas o repositório já tem
documentação equivalente, mais enxuta, voltada a outras ferramentas/agentes
de IA — vale manter as duas em sincronia ao mudar uma convenção:

- **`.github/copilot-instructions.md`** — baseline global em inglês, cobre
  arquitetura, convenções, "clean code rules", regras de teste e comandos.
- **`.github/skills/*/SKILL.md`** — cinco skills temáticas (
  `clean-architecture`, `env-gateways`, `feature-structure`,
  `nestjs-prisma`, `testing-patterns`), cada uma com padrão/regras/exemplo/
  "do not do" focado em um recorte da arquitetura. O conteúdo deste arquivo
  foi escrito cruzando essas skills com a leitura direta do código-fonte.
- **`.continue/rules/setup.md`** — versão bem resumida (3 bullets) da regra
  de camadas, usada pela extensão Continue.
- **`prds/`** — PRDs pontuais de features específicas (ex.:
  `find-product-by-id-use-case-extension-prd.md`). São registros históricos
  de planejamento, não necessariamente o reflexo exato do que foi
  implementado ao final — em caso de divergência entre um PRD e o código
  atual, o código (e este `CLAUDE.md`) prevalece.

> ⚠️ **`docs/agents.md`** e **`skills/agent_discovery_skill.md`** descrevem
> uma "arquitetura de agents" (`src/core/agents`, `src/domain/agents`,
> `src/infra/agents`, `BaseAgent`, etc.) que **não existe** em nenhum lugar
> do código-fonte real deste projeto — nenhum desses diretórios ou classes
> foi encontrado em `src/`. Esses dois arquivos estão desatualizados (ou
> nunca corresponderam ao projeto) e **não devem ser usados como
> referência de arquitetura**. A arquitetura real está descrita neste
> `CLAUDE.md` e nas skills de `.github/skills/`.

---

## 23. Débito técnico conhecido

> Revisado em 23/10/2026 — vários itens da leitura anterior já foram
> corrigidos (ver histórico abaixo da lista). O que segue é só o que ainda
> permanece no código.

Pontos identificados na leitura do código atual que vale ter em mente antes
de mexer nas áreas correspondentes — nenhum deles é "o padrão a seguir",
são desvios/pendências já existentes:

- **`AwsS3StorageService` sem `endpoint` configurado**
  (`infra/shared/gateways/storage/aws-s3-storage.service.ts`): `region` e
  `credentials` já foram corrigidos para ler `AWS_REGION`/
  `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` (em vez de `DATABASE_URL` e
  credenciais hardcoded), mas a linha `endpoint` do `S3Client` ficou
  **comentada** (`// endpoint: this.envService.get('DATABASE_URL'),`) em vez
  de apontar para `AWS_S3_ENDPOINT`. Sem `endpoint`, o SDK usa o endpoint
  público real da AWS para a `region` configurada — ou seja, em
  desenvolvimento local o serviço não aponta mais para o LocalStack.
  `AWS_S3_ENDPOINT` continua validado como obrigatório em `envSchema`
  (`infra/shared/env/env.schema.ts`), mas hoje não é lido em lugar nenhum —
  falta só descomentar/trocar essa linha para `this.envService.get('AWS_S3_ENDPOINT')`.
- **`pnpm run test:e2e` sem config correspondente**: o script em
  `package.json` ainda roda `vitest run --config ./vitest.config.e2e.mjs`,
  e esse arquivo continua não existindo no repositório — o comando falha
  imediatamente se executado.
- **Import do client Prisma por dois caminhos diferentes** — parcialmente
  corrigido: `prisma-products.repository.ts` já foi padronizado para
  `@generated/prisma/client` (mesmo alias usado em `prisma.service.ts`),
  mas `prisma-categories.repository.ts`, `prisma-products.mapper.ts` e
  `prisma-categories.mapper.ts` ainda importam via
  `@/../generated/prisma/client`. Ambos os caminhos resolvem para o mesmo
  lugar via `tsconfig.json`, mas sem padronização — faltam esses três
  arquivos para fechar a migração para `@generated/*`.
- **Código morto / comentado em alguns pontos de produção**: ainda
  presentes — `// if (sendToQueueResult.isLeft()) return left(...)` em
  `CreateProductUseCase`, `// SwaggerModule.setup('old-docs', ...)` em
  `Swagger.ts`, e o bloco de `node-api` comentado em `docker-compose.yml`.
  Nenhum afeta o comportamento atual, mas vale limpar ou resolver em vez de
  deixar acumulando.
- **Vários `// TODO: Colocar em um presenter`** continuam espalhados pelos
  controllers (seção 8) — serialização de entidade → resposta HTTP segue
  repetida manualmente em cada `handle()`.
- **`QueueConsumerService` para após a primeira mensagem**: o loop em
  `startConsuming()` ainda seta `this.isConsuming = false` assim que
  consome uma mensagem com sucesso, então o consumo contínuo de fila
  continua não efetivamente ativo além da primeira mensagem recebida após
  o boot.
- **`UpdateProductUseCase` ainda engole falhas de fila/storage
  silenciosamente**: `sendProductToQueue`/`sendProductToStorage` capturam
  qualquer exceção e devolvem `left(new Error(...))`, mas esse `Either`
  continua nunca sendo checado pelo `execute()` principal — ao contrário de
  `CreateProductUseCase`, que propaga `SendToStorageError` para o `Either`
  de retorno, uma falha de storage/fila em `UpdateProductUseCase` não
  impede a resposta `right(...)` de sucesso nem é reportada ao chamador.

### Já corrigido (não precisa de atenção)

Para referência — itens da revisão anterior deste `CLAUDE.md` que já foram
resolvidos e **não** devem ser reintroduzidos:

- `DeleteProductByIdUseCase` e `DeleteCategoryByIdUseCase` agora validam a
  existência do recurso e devolvem erros tipados dedicados
  (`ProductIdNotFoundError`/`CategoryIdNotFoundError`, ambos registrados em
  `mapErrorToStatusCode` com `HttpStatus.NOT_FOUND`) em vez de um `Error`
  genérico ou de pular a validação.
- O controller de delete de `Category` foi renomeado de
  `DeleteCategoryByIdCategoryController` para `DeleteCategoryByIdController`
  — agora segue o mesmo padrão `Delete<Entidade>ByIdController` usado em
  `Product`.

Nenhum dos pontos ainda em aberto deve ser "corrigido de passagem" sem que a
tarefa seja especificamente sobre eles — mas qualquer código novo que toque
essas áreas deve pelo menos não piorá-los, e idealmente seguir o padrão
correto descrito nas seções anteriores (em vez do comportamento atual
listado aqui).
