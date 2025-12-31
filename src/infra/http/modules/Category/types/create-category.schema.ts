import { extendApi } from '@anatine/zod-openapi';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod/v4';

import { ID } from '@/core/entities/id';

export const createCategorySchema = extendApi(
  z.object({
    title: z.string(),
    description: z.string(),
    ownerId: z.string().refine((value: string) => new ID(value).isValid(), { error: 'Invalid ID' }),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
  }),
);

export const createCategoryResponseSchema = extendApi(z.object({}));

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
// export class CreateWalletDTO extends createZodDto(createWalletSchema) {}

export class CreateCategoryDTO {
  @ApiProperty({ example: faker.person.fullName() })
  fullname!: string;

  @ApiProperty({ example: faker.internet.email().toLowerCase() })
  email!: string;
}
// TODO: manually create the response DTO
export class CreateWalletResponse {}
