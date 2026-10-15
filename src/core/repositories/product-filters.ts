/**
 * Única fonte da verdade para os campos projetáveis de `Product`. A lista é
 * usada tanto para derivar o tipo `ProductFilters` quanto, em runtime, para
 * validar o parâmetro `fields` da query string na camada HTTP (ver
 * `find-product.schema.ts`) — evita que tipo e validação fiquem fora de
 * sincronia conforme novos campos forem adicionados.
 */
export const PRODUCT_FILTER_FIELDS = [
  'title',
  'description',
  'price',
  'ownerId',
  'category',
  'createdAt',
  'updatedAt',
] as const;

export type ProductFilterField = (typeof PRODUCT_FILTER_FIELDS)[number];

export type ProductFilters = Partial<Record<ProductFilterField, boolean>>;
