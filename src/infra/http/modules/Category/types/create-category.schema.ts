import {} from 'nestjs-zod';
import { z } from 'zod/v4';

import { ID } from '@/core/entities/id';

export const createCategorySchema = z.object({
  title: z
    .string()
    .min(1)
    .refine((value: string) => value.trim().length > 0, { error: 'Title cannot be empty' }),
  description: z.string(),
  ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
});

export const createCategoryResponseSchema = z.object({
  category: z.object({
    id: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    title: z.string(),
    description: z.string(),
    ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional().nullable(),
  }),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
// export class CreateWalletDTO extends createZodDto(createWalletSchema) {}

// export class CreateCategoryDTO {
//   @ApiProperty({ example: faker.person.fullName() })
//   fullname!: string;

//   @ApiProperty({ example: faker.internet.email().toLowerCase() })
//   email!: string;
// }
// TODO: manually create the response DTO
// export class CreateWalletResponse {}
