import z from 'zod';

import { ID } from '@/core/entities/id';

export const updateCategorySchema = z.object({
  id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
  title: z.string().optional(),
  description: z.string().optional(),
  ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }).optional(),
});

export const updateCategoryResponseSchema = z.object({
  category: z.object({
    id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    title: z.string(),
    description: z.string(),
    ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional().nullable(),
  }),
});
