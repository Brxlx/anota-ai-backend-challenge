import { UseCaseError } from '@/core/errors/use-case.error';

export class InvalidProductOwnerIdError extends Error implements UseCaseError {
  constructor() {
    super('Invalid OwnerId');
  }
}
