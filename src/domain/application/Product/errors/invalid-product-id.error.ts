import { UseCaseError } from '@/core/errors/use-case.error';

export class InvalidProductIdError extends Error implements UseCaseError {
  constructor() {
    super('Invalid product id');
  }
}
