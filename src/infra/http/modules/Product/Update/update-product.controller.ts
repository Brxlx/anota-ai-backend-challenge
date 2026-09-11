import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { UpdateProductDTO, UpdateProductResponseDTO } from '../types/product.dto';
import { updateProductSchema } from '../types/update-product.schema';
import { UpdateProductService } from './update-product.service';

@ApiTags('Product')
@Controller('/products')
export class UpdateProductController {
  constructor(private readonly updateProductService: UpdateProductService) {}

  @ApiOperation({ summary: 'update a product by id' })
  @ZodResponse({ type: UpdateProductResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema.omit({ id: true }))) body: Omit<UpdateProductDTO, 'id'>,
  ) {
    const result = await this.updateProductService.execute(id, {
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
