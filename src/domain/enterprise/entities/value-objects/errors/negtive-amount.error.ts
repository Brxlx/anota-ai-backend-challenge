import { EntityError } from '@/core/errors/entity.error';

export class NegativeAmountError extends Error implements EntityError {
  constructor() {
    super('O valor deve ser positivo');
  }
}
