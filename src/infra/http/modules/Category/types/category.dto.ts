import { createZodDto } from 'nestjs-zod';

import {
  createCategoryResponseSchema,
  createCategorySchema,
} from '@/infra/http/modules/Category/types/create-category.schema';

export class CreateCategoryDTO extends createZodDto(createCategorySchema) {}

export class CreateCategoryResponseDTO extends createZodDto(createCategoryResponseSchema) {}
