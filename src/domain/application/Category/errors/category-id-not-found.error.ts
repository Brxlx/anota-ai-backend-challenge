import { UseCaseError } from '@/core/errors/use-case.error';

export class CategoryIdNotFoundError extends Error implements UseCaseError {
  constructor() {
    super('Id not found');
  }
}
