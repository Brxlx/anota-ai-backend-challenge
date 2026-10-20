import { Injectable } from '@nestjs/common';

import { Prisma } from '@/../generated/prisma/client';
import { PaginatedResult, PaginationParams } from '@/core/repositories/pagination-params';
import { ProductFilters } from '@/core/repositories/product-filters';
import {
  ProductsRepository,
  ProductUpdateData,
} from '@/domain/application/Product/repositories/products.repository';
import { Product } from '@/domain/enterprise/entities/product';

import { PrismaProductsMapper } from '../mappers/prisma-products.mapper';
import { PrismaService } from '../prisma.service';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findManyPartial(
    { cursor, limit = DEFAULT_LIMIT }: PaginationParams,
    filters: ProductFilters,
  ): Promise<PaginatedResult<Partial<Product>>> {
    const take = Math.min(limit, MAX_LIMIT);

    // Tipado explicitamente como `Prisma.ProductFindManyArgs` (em vez de
    // inferido por `cursor ? {...} : {}`) para evitar que o TS trate isso
    // como um tipo união ao espalhar no literal de `findMany` abaixo —
    // união essa que o Prisma rejeita, por sua assinatura ser acoplada ao
    // shape exato de `select`/`cursor` para inferir o retorno.
    const baseArgs: Prisma.ProductFindManyArgs = {
      take: take + 1,
      orderBy: { id: 'asc' },
    };

    if (cursor) {
      baseArgs.cursor = { id: cursor };
      baseArgs.skip = 1;
    }

    if (filters) {
      const products = await this.prismaService.product.findMany({
        ...baseArgs,
        select: this.buildSelect(filters),
      });

      return this.buildPaginatedResult(products, take, PrismaProductsMapper.toDomainPartial);
    }

    const products = await this.prismaService.product.findMany(baseArgs);

    return this.buildPaginatedResult(products, take, PrismaProductsMapper.toDomain);
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prismaService.product.findMany();

    return products.map(PrismaProductsMapper.toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return PrismaProductsMapper.toDomain(product);
  }

  async findByIdPartial(id: string, filters: ProductFilters): Promise<Partial<Product> | null> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      select: this.buildSelect(filters),
    });

    if (!product) return null;

    return PrismaProductsMapper.toDomainPartial(product);
  }

  async findByTitle(title: string): Promise<Product | null> {
    const product = await this.prismaService.product.findUnique({
      where: {
        title,
      },
    });

    if (!product) return null;

    return PrismaProductsMapper.toDomain(product);
  }

  async create(product: Product): Promise<Product> {
    const raw = PrismaProductsMapper.toPrisma(product);
    const createdProduct = await this.prismaService.product.create({
      data: raw,
    });

    return PrismaProductsMapper.toDomain(createdProduct);
  }

  async update(product: Product, changes: ProductUpdateData): Promise<void> {
    // Monta o `data` apenas com os campos que vieram no PATCH (+ `updatedAt`,
    // que acompanha a entidade). `id` nunca entra aqui: é usado só em `where`
    // — passá-lo em `data` é rejeitado pelo Prisma ("Unknown argument `id`").
    const data: Prisma.ProductUncheckedUpdateInput = {
      ...(changes.title !== undefined && { title: changes.title }),
      ...(changes.description !== undefined && { description: changes.description }),
      ...(changes.ownerId !== undefined && { ownerId: changes.ownerId }),
      ...(changes.price !== undefined && { price: changes.price }),
      ...(changes.category !== undefined && { categoryId: changes.category }),
      updatedAt: product.updatedAt ?? undefined,
    };

    await this.prismaService.product.update({
      where: { id: product.id.toValue() },
      data,
    });
  }

  async delete(productId: string): Promise<void> {
    await this.prismaService.product.delete({
      where: { id: productId },
    });
  }

  /**
   * Converte o `ProductFilters` (projeção de campos do domínio) em um
   * `Prisma.ProductSelect`. `id` é sempre incluído, pois é necessário para
   * reconstruir a identidade da entidade.
   *
   * `category` é mapeado para o campo escalar `categoryId` do Prisma, não
   * para a relação `category` — o domínio representa categoria como `ID`
   * (ver `PrismaProductsMapper`), e selecionar a relação traria um objeto
   * aninhado desnecessário.
   */
  private buildSelect(filters: ProductFilters): Prisma.ProductSelect {
    return {
      id: true,
      title: filters.title,
      description: filters.description,
      price: filters.price,
      ownerId: filters.ownerId,
      categoryId: filters.category,
      createdAt: filters.createdAt,
      updatedAt: filters.updatedAt,
    };
  }

  /**
   * Corta o item extra buscado em `take + 1` para derivar `nextCursor` sem
   * uma segunda query (`count`/outro `findMany`). Compartilhado pelos dois
   * ramos (projeção completa e parcial) de `findManyPaginated`.
   */
  private buildPaginatedResult<T extends { id: string }, R>(
    rows: T[],
    take: number,
    toDomain: (row: T) => R,
  ): PaginatedResult<R> {
    const hasNextPage = rows.length > take;
    const page = hasNextPage ? rows.slice(0, -1) : rows;

    return {
      items: page.map(toDomain),
      nextCursor: hasNextPage ? page[page.length - 1].id : null,
    };
  }
}
