import { Either } from '@/core/types/either';

export abstract class Storage {
  abstract save(topic: string, message: string): Promise<Either<Error, string>>;
  abstract get(topic: string): Promise<Either<Error, string>>;
}
