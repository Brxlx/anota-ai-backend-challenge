import { createZodDto } from 'nestjs-zod';

import {
  createCategoryResponseSchema,
  createCategorySchema,
} from '@/infra/http/modules/Category/types/create-category.schema';

import { deleteCategoryResponseSchema, deleteCategorySchema } from './delete-category.schema';
import { findCategoryResponseSchema, findCategorySchema } from './find-category.schema';
import { updateCategoryResponseSchema, updateCategorySchema } from './update-category.schema';

export class CreateCategoryDTO extends createZodDto(createCategorySchema) {}
export class CreateCategoryResponseDTO extends createZodDto(createCategoryResponseSchema) {}

export class DeleteCategoryDTO extends createZodDto(deleteCategorySchema) {}
export class DeleteCategoryResponseDTO extends createZodDto(deleteCategoryResponseSchema) {}

export class FindCategoryDTO extends createZodDto(findCategorySchema) {}
export class FindCategoryResponseDTO extends createZodDto(findCategoryResponseSchema) {}

export class UpdateCategoryDTO extends createZodDto(updateCategorySchema) {}
export class UpdateCategoryResponseDTO extends createZodDto(updateCategoryResponseSchema) {}
