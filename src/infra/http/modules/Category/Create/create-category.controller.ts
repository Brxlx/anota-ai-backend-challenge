import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { type CreateCategorySchema } from '../types/create-category.schema';
import { CreateCategoryService } from './create-category.service';

@Controller('/categories')
export class CreateCategoryController {
  constructor(private readonly createCategoryService: CreateCategoryService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body() body: CreateCategorySchema) {
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
