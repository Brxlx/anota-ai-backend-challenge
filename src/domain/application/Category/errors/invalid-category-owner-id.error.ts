import { UseCaseError } from '@/core/errors/use-case.error';

export class InvalidCategoryOwnerIdError extends Error implements UseCaseError {
  constructor() {
    super('Invalid OwnerId');
  }
}
