import { ValueObject } from '@/core/entities/value-object';

import { NegativeAmountError } from './errors/negtive-amount.error';

export interface PriceProps {
  amount: number;
}
export class Price extends ValueObject<PriceProps> {
  get amount() {
    return this.props.amount;
  }

  get formattedAmount() {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.props.amount);
  }

  static createBRL(amount: number): Price {
    if (amount < 0) {
      throw new NegativeAmountError();
    }
    return new Price({ amount });
  }
}
