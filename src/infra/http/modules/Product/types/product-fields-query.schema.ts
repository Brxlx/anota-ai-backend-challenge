import z from 'zod';

import { PRODUCT_FILTER_FIELDS, ProductFilters } from '@/core/repositories/product-filters';

/**
 * Schema compartilhado para o parâmetro de query `?fields=title,price`,
 * usado tanto por `GET /products/:id` (`find-product.schema.ts`) quanto
 * por `GET /products` (`list-product.schema.ts`) — extraído daqui para não
 * duplicar a mesma validação/transformação nos dois lugares.
 *
 * Cada campo é validado contra `PRODUCT_FILTER_FIELDS` — um campo
 * desconhecido rejeita a requisição com 400. Ausência do parâmetro (ou uma
 * string vazia) resulta em `fields: undefined`, interpretado pelos
 * controllers como "sem filtro" (produto completo).
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

export const productFieldsQuerySchema = z.object({
  fields: fieldsListSchema.optional().transform((fields): ProductFilters | undefined => {
    if (!fields || fields.length === 0) return undefined;

    return fields.reduce<ProductFilters>((filters, field) => {
      filters[field] = true;
      return filters;
    }, {});
  }),
});
