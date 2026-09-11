import { Body, Controller, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import {
  UpdateCategoryDTO,
  UpdateCategoryResponseDTO,
} from '../types/category.dto';
import { updateCategorySchema } from '../types/update-category.schema';
import { UpdateCategoryService } from './update-category.service';

@ApiTags('Category')
@Controller('/categories')
export class UpdateCategoryController {
  constructor(private readonly updateCategoryService: UpdateCategoryService) {}

  @ApiOperation({ summary: 'update a category by id' })
  @ZodResponse({ type: UpdateCategoryResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCategorySchema.omit({ id: true }))) body: Omit<UpdateCategoryDTO, 'id'>,
  ) {
    const result = await this.updateCategoryService.execute(id, {
      title: body.title,
      description: body.description,
      ownerId: body.ownerId,
    });

    if (result.isLeft()) {
      throw result.value;
    }

    // TODO: Colocar em um presenter
    return {
      category: {
        id: result.value.category.id.toString(),
        title: result.value.category.title,
        description: result.value.category.description,
        ownerId: result.value.category.ownerId.toString(),
        createdAt: result.value.category.createdAt.toISOString(),
        updatedAt: result.value.category.updatedAt?.toISOString(),
      },
    };
  }
}
