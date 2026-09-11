import z from 'zod';

import { ID } from '@/core/entities/id';

export const updateProductSchema = z.object({
  id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
  title: z.string().optional(),
  description: z.string().optional(),
  ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }).optional(),
  price: z.number().positive().optional(),
  category: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }).optional(),
});

export const updateProductResponseSchema = z.object({
  product: z.object({
    id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    title: z.string(),
    description: z.string(),
    ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    price: z.number(),
    category: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional().nullable(),
  }),
});
