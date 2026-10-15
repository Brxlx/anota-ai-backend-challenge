import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { PRODUCT_FILTER_FIELDS } from '@/core/repositories/product-filters';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { findProductQuerySchema, findProductSchema } from '../types/find-product.schema';
import { FindProductDTO, FindProductQueryDTO, FindProductResponseDTO } from '../types/product.dto';
import { FindProductByIdService } from './find-product.service';

@ApiTags('Product')
@Controller('/products')
export class FindProductByIdController {
  constructor(private readonly findProductByIdService: FindProductByIdService) {}

  @ApiOperation({ summary: 'find a product by id' })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: `Comma-separated list of fields to return (e.g. "title,price"). 
    Valid fields: ${PRODUCT_FILTER_FIELDS.join(', ')}. Omit to return the full product.`,
  })
  @ZodResponse({ type: FindProductResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async handle(
    @Param(new ZodValidationPipe(findProductSchema)) params: FindProductDTO,
    @Query(new ZodValidationPipe(findProductQuerySchema)) query: FindProductQueryDTO,
  ) {
    const result = await this.findProductByIdService.execute({
      id: params.id,
      ...(query.fields && { filters: query.fields }),
    });

    if (result.isLeft()) {
      throw result.value;
    }

    const { product } = result.value;

    // TODO: Colocar em um presenter
    return {
      product: {
        // `id` é sempre incluído, com ou sem `fields` (ver
        // `ProductsRepository.findByIdPartial` e `PrismaProductsMapper`).
        id: product.id!.toString(),
        title: product.title,
        description: product.description,
        ownerId: product.ownerId?.toString(),
        price: product.price?.amount,
        category: product.category?.toString(),
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
      },
    };
  }
}
