import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { PRODUCT_FILTER_FIELDS } from '@/core/repositories/product-filters';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { listProductQuerySchema } from '../types/find-products.schema';
import { ListProductQueryDTO, ListProductResponseDTO } from '../types/product.dto';
import { ListProductsService } from './list-products.service';

@ApiTags('Product')
@Controller('/products')
export class ListProductsController {
  constructor(private readonly listProductsService: ListProductsService) {}

  @ApiOperation({ summary: 'list products with cursor-based pagination' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'id of the last item received in the previous page. Omit to fetch the first page.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default 20, max 100).',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: `Comma-separated list of fields to return (e.g. "title,price"). 
    Valid fields: ${PRODUCT_FILTER_FIELDS.join(', ')}. Omit to return the full product.`,
  })
  @ZodResponse({ type: ListProductResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(@Query(new ZodValidationPipe(listProductQuerySchema)) query: ListProductQueryDTO) {
    const result = await this.listProductsService.execute({
      cursor: query.cursor,
      limit: query.limit,
      ...(query.fields && { filters: query.fields }),
    });

    if (result.isLeft()) {
      throw result.value;
    }

    const { items, nextCursor } = result.value;

    // TODO: Colocar em um presenter (mesma dívida já sinalizada em
    // `find-product.controller.ts`).
    return {
      products: items.map((product) => ({
        id: product.id!.toString(),
        title: product.title,
        description: product.description,
        ownerId: product.ownerId?.toString(),
        price: product.price?.amount,
        category: product.category?.toString(),
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
      })),
      nextCursor,
    };
  }
}
