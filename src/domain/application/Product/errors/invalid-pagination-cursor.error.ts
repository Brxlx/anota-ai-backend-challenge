import { UseCaseError } from '@/core/errors/use-case.error';

export class InvalidPaginationCursorError extends Error implements UseCaseError {
  constructor() {
    super('Invalid pagination cursor');
  }
}
