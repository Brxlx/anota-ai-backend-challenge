import z from 'zod';

import { ID } from '@/core/entities/id';

import { productFieldsQuerySchema } from './product-fields-query.schema';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const listProductQuerySchema = productFieldsQuerySchema.extend({
  cursor: z
    .string()
    .refine((value: string) => new ID(value).isValid(), { error: 'Invalid cursor' })
    .optional(),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
});

export const listProductResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
      title: z.string().optional(),
      description: z.string().optional(),
      ownerId: z
        .string()
        .refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' })
        .optional(),
      price: z.number().optional(),
      category: z
        .string()
        .refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' })
        .optional(),
      createdAt: z.string().datetime().optional(),
      updatedAt: z.string().datetime().optional().nullable(),
    }),
  ),
  nextCursor: z.string().nullable(),
});
