import z from 'zod';

import { ID } from '@/core/entities/id';
import { PRODUCT_FILTER_FIELDS, ProductFilters } from '@/core/repositories/product-filters';

export const findProductSchema = z.object({
  id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
});

/**
 * Query string `?fields=title,price`: lista de campos (separados por
 * vírgula) que o cliente quer de volta. Cada campo é validado contra
 * `PRODUCT_FILTER_FIELDS` — um campo desconhecido rejeita a requisição com
 * 400. Ausência do parâmetro (ou uma string vazia) resulta em `fields:
 * undefined`, e o controller interpreta isso como "sem filtro" (produto
 * completo).
 */
const fieldsListSchema = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.enum(PRODUCT_FILTER_FIELDS)));

export const findProductQuerySchema = z.object({
  fields: fieldsListSchema.optional().transform((fields): ProductFilters | undefined => {
    if (!fields || fields.length === 0) return undefined;

    return fields.reduce<ProductFilters>((filters, field) => {
      filters[field] = true;
      return filters;
    }, {});
  }),
});

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
