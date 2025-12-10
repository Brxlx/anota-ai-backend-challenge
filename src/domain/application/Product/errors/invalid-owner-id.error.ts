import { UseCaseError } from '@/core/errors/use-case.error';

export class InvalidOwnerIdError extends Error implements UseCaseError {
  constructor() {
    super('Invalid OwnerId');
  }
}
