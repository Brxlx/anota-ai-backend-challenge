import { createZodDto } from 'nestjs-zod';

import {
  createProductResponseSchema,
  createProductSchema,
} from '@/infra/http/modules/Product/types/create-product.schema';

import { deleteProductResponseSchema, deleteProductSchema } from './delete-product.schema';
import { findProductResponseSchema, findProductSchema } from './find-product.schema';
import { updateProductResponseSchema, updateProductSchema } from './update-product.schema';

export class CreateProductDTO extends createZodDto(createProductSchema) {}
export class CreateProductResponseDTO extends createZodDto(createProductResponseSchema) {}

export class DeleteProductDTO extends createZodDto(deleteProductSchema) {}
export class DeleteProductResponseDTO extends createZodDto(deleteProductResponseSchema) {}

export class FindProductDTO extends createZodDto(findProductSchema) {}
export class FindProductResponseDTO extends createZodDto(findProductResponseSchema) {}

export class UpdateProductDTO extends createZodDto(updateProductSchema) {}
export class UpdateProductResponseDTO extends createZodDto(updateProductResponseSchema) {}
