import { NegativeAmountError } from './errors/negtive-amount.error';
import { Price } from './price';

describe('[Price] Value Object', () => {
  it('should create a Price with valid amount', () => {
    const price = Price.createBRL(100);
    expect(price.amount).toBe(100);
    expect(price.formattedAmount).toBe('R$ 100,00');
  });

  it('should throw NegativeAmountError for negative amount', () => {
    expect(() => Price.createBRL(-50)).toThrow(NegativeAmountError);
  });

  it('should format amount correctly in BRL', () => {
    const price = Price.createBRL(2500.5);
    expect(price.formattedAmount).toBe('R$ 2.500,50');
  });
});
