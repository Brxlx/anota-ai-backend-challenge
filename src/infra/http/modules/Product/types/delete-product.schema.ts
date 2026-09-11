import z from 'zod';

import { ID } from '@/core/entities/id';

export const deleteProductSchema = z.object({
  id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
});

export const deleteProductResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
      title: z.string(),
      description: z.string(),
      ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
      price: z.number(),
      category: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime().optional().nullable(),
    }),
  ),
});
