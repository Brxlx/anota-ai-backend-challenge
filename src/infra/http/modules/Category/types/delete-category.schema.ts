import z from 'zod';

import { ID } from '@/core/entities/id';

export const deleteCategorySchema = z.object({
  id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
});

export const deleteCategoryResponseSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
      title: z.string(),
      description: z.string(),
      ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime().optional().nullable(),
    }),
  ),
});
