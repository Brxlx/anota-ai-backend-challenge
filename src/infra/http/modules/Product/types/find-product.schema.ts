import z from 'zod';

import { ID } from '@/core/entities/id';

import { productFieldsQuerySchema } from './product-fields-query.schema';

export const findProductSchema = z.object({
  id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
});

export const findProductQuerySchema = productFieldsQuerySchema;

export const findProductResponseSchema = z.object({
  product: z.object({
    // `id` é sempre retornado, com ou sem `fields` (necessário para
    // reidentificar a entidade).
    id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    // Os demais campos ficam opcionais: quando `fields` é usado, só os
    // campos selecionados vêm preenchidos na resposta.
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
});
