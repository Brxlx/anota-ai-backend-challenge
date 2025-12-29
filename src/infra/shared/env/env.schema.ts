import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  APP_PORT: z.coerce.number().default(3333),
  BASE_URL: z.url(),
  DATABASE_URL: z.url().startsWith('mongodb://'),
});

const envRegistry = z.registry<{
  title: string;
  description: string;
}>();

envSchema.register(envRegistry, {
  title: 'Env Schema',
  description: 'The environment variables schema definition',
});

export type Env = z.infer<typeof envSchema>;
