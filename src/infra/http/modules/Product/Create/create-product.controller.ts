import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { CreateProductDTO, CreateProductResponseDTO } from '../types/product.dto';
import { createProductSchema } from '../types/create-product.schema';
import { CreateProductService } from './create-product.service';

@ApiTags('Product')
@Controller('/products')
export class CreateProductController {
  constructor(private readonly createProductService: CreateProductService) {}

  @ApiOperation({ summary: 'creates a new product' })
  @ZodResponse({ type: CreateProductResponseDTO, status: HttpStatus.CREATED })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body(new ZodValidationPipe(createProductSchema)) body: CreateProductDTO) {
    const result = await this.createProductService.execute({
      title: body.title,
      description: body.description,
      ownerId: body.ownerId,
      price: body.price,
      category: body.category,
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
