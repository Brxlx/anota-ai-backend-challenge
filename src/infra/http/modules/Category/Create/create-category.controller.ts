import { Body, Controller, HttpCode, HttpStatus, Post, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse, ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { CreateCategoryDTO, CreateCategoryResponseDTO } from '../types/category.dto';
import { type CreateCategorySchema, createCategorySchema } from '../types/create-category.schema';
import { CreateCategoryService } from './create-category.service';

@ApiTags('Category')
@Controller('/categories')
export class CreateCategoryController {
  constructor(private readonly createCategoryService: CreateCategoryService) {}

  @ApiOperation({ summary: 'creates a new category' })
  @UsePipes(ZodValidationPipe)
  @UseInterceptors(ZodSerializerInterceptor)
  @ZodResponse({ type: CreateCategoryResponseDTO, status: HttpStatus.CREATED })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body(/*new ZodValidationPipe(createCategorySchema)*/) body: CreateCategoryDTO) {
    const result = await this.createCategoryService.execute({
      title: body.title,
      description: body.description,
      ownerId: body.ownerId,
    });

    if (result.isLeft()) {
      throw result.value;
    }

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
