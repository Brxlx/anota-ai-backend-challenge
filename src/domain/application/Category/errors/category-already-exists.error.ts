import { UseCaseError } from '@/core/errors/use-case.error';

export class CategoryAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('Category already exists');
  }
}
