import { Controller, Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { DeleteProductDTO, DeleteProductResponseDTO } from '../types/product.dto';
import { deleteProductSchema } from '../types/delete-product.schema';
import { DeleteProductByIdService } from './delete-product.service';

@ApiTags('Product')
@Controller('/products')
export class DeleteProductByIdController {
  constructor(private readonly deleteProductByIdService: DeleteProductByIdService) {}

  @ApiOperation({ summary: 'delete a product by id' })
  @ZodResponse({ type: DeleteProductResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async handle(@Param(new ZodValidationPipe(deleteProductSchema)) params: DeleteProductDTO) {
    const result = await this.deleteProductByIdService.execute({
      id: params.id,
    });

    if (result.isLeft()) {
      throw result.value;
    }

    // TODO: Colocar em um presenter
    return {
      products: result.value.map((product) => {
        return {
          id: product.id.toString(),
          title: product.title,
          description: product.description,
          ownerId: product.ownerId.toString(),
          price: product.price.amount,
          category: product.category.toString(),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt?.toISOString(),
        };
      }),
    };
  }
}
