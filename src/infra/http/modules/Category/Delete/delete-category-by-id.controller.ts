import { Controller, Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { DeleteCategoryDTO, DeleteCategoryResponseDTO } from '../types/category.dto';
import { deleteCategorySchema } from '../types/delete-category.schema';
import { DeleteCategoryByIdService } from './delete-category.service';

@ApiTags('Category')
@Controller('/categories')
export class DeleteCategoryByIdCategoryController {
  constructor(private readonly deleteCategoryByIdService: DeleteCategoryByIdService) {}

  @ApiOperation({ summary: 'delete a category by id' })
  @ZodResponse({ type: DeleteCategoryResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async handle(@Param(new ZodValidationPipe(deleteCategorySchema)) params: DeleteCategoryDTO) {
    const result = await this.deleteCategoryByIdService.execute({
      id: params.id,
    });

    if (result.isLeft()) {
      throw result.value;
    }

    // TODO: Colocar em um presenter
    return {
      categories: result.value.map((category) => {
        return {
          id: category.id.toString(),
          title: category.title,
          ownerId: category.ownerId.toString(),
          description: category.description,
          createdAt: category.createdAt.toDateString(),
          updatedAt: category.updatedAt?.toISOString(),
        };
      }),
    };
  }
}
