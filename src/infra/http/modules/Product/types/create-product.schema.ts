import z from 'zod';

import { ID } from '@/core/entities/id';

export const createProductSchema = z.object({
  title: z
    .string()
    .min(1)
    .refine((value: string) => value.trim().length > 0, { error: 'Title cannot be empty' }),
  description: z.string(),
  ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
  price: z.number().positive(),
  category: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
});

export const createProductResponseSchema = z.object({
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
