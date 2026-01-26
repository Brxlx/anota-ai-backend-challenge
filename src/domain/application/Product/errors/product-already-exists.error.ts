import { UseCaseError } from '@/core/errors/use-case.error';

export class ProductAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('Product already exists');
  }
}
