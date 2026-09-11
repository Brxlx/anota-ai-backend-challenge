import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { FindProductDTO, FindProductResponseDTO } from '../types/product.dto';
import { findProductSchema } from '../types/find-product.schema';
import { FindProductByIdService } from './find-product.service';

@ApiTags('Product')
@Controller('/products')
export class FindProductByIdController {
  constructor(private readonly findProductByIdService: FindProductByIdService) {}

  @ApiOperation({ summary: 'find a product by id' })
  @ZodResponse({ type: FindProductResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async handle(@Param(new ZodValidationPipe(findProductSchema)) params: FindProductDTO) {
    const result = await this.findProductByIdService.execute({
      id: params.id,
    });

    if (result.isLeft()) {
      throw result.value;
    }

    // TODO: Colocar em um presenter
    return {
      product: {
        id: result.value.product.id.toString(),
        title: result.value.product.title,
        description: result.value.product.description,
        ownerId: result.value.product.ownerId.toString(),
        price: result.value.product.price.amount,
        category: result.value.product.category.toString(),
        createdAt: result.value.product.createdAt.toISOString(),
        updatedAt: result.value.product.updatedAt?.toISOString(),
      },
    };
  }
}
