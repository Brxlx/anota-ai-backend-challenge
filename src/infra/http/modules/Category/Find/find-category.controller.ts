import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { FindCategoryDTO, FindCategoryResponseDTO } from '../types/category.dto';
import { findCategorySchema } from '../types/find-category.schema';
import { FindCategoryByIdService } from './find-category.service';

@ApiTags('Category')
@Controller('/categories')
export class FindCategoryByIdController {
  constructor(private readonly findCategoryByIdService: FindCategoryByIdService) {}

  @ApiOperation({ summary: 'find a category by id' })
  @ZodResponse({ type: FindCategoryResponseDTO, status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async handle(@Param(new ZodValidationPipe(findCategorySchema)) params: FindCategoryDTO) {
    const result = await this.findCategoryByIdService.execute({
      id: params.id,
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
