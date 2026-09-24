import { z } from 'zod';

export class EnvValidationError extends Error {
  readonly errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message);
    this.name = 'EnvValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  APP_PORT: z.coerce.number().default(3333),
  BASE_URL: z.url(),
  DATABASE_URL: z.url().startsWith('mongodb://'),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SQS_ENDPOINT: z.url(),
  AWS_QUEUE_TOPIC: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_ENDPOINT: z.url(),
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

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errorMap: Record<string, string> = {};
    const errorDetails = result.error.issues.map((issue) => {
      const fieldName = issue.path.join('.') || 'env';
      errorMap[fieldName] = issue.message;
      return `  • ${fieldName}: ${issue.message}`;
    });

    const formattedMessage = `Invalid environment variables:\n${errorDetails.join('\n')}`;

    throw new EnvValidationError(formattedMessage, errorMap);
  }

  return result.data;
}
