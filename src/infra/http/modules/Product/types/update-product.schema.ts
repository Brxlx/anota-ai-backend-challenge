import z from 'zod';

import { ID } from '@/core/entities/id';

export const updateProductSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    ownerId: z
      .string()
      .refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' })
      .optional(),
    price: z.number().positive().optional(),
    category: z
      .string()
      .refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' })
      .optional(),
  })
  // PATCH: todos os campos são opcionais individualmente, mas o body não pode
  // vir vazio — senão a requisição passa na validação sem atualizar nada.
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: 'At least one field must be provided to update the product',
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
