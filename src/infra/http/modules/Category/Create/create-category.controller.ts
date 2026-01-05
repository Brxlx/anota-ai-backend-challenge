import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';

import { type CreateCategorySchema, createCategorySchema } from '../types/create-category.schema';
import { CreateCategoryService } from './create-category.service';

@Controller('/categories')
export class CreateCategoryController {
  constructor(private readonly createCategoryService: CreateCategoryService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategorySchema) {
    const result = await this.createCategoryService.execute({
      title: body.title,
      description: body.description,
      ownerId: body.ownerId,
    });

    if (result.isLeft()) {
      throw result.value;
    }

    return result.value;
  }
}
