import { makeProductFactory } from 'test/factories/make-product.factory';

import { ID } from '@/core/entities/id';

import { Product } from './product';
import { NegativeAmountError } from './value-objects/errors/negtive-amount.error';
import { Price } from './value-objects/price';

describe('[Product]', () => {
  it('should be able to create a new product', () => {
    const newProduct = Product.create({
      title: 'test',
      description: 'This is the test description',
      ownerId: new ID('user1'),
      price: Price.createBRL(1.99),
      category: new ID('category-1'),
    });

    expect(newProduct).toBeInstanceOf(Product);
    expect(newProduct.title).toEqual('test');
    expect(newProduct.description).toEqual('This is the test description');
    expect(newProduct.ownerId.toString()).toEqual('user1');
    expect(newProduct.price.amount).toEqual(1.99);
    expect(newProduct.category.toString()).toEqual('category-1');
  });

  it('should be able to create a new product with category with factory', () => {
    const categoryId = 'category-1';
    const amount = 1.99;

    const newProduct = makeProductFactory({
      ownerId: 'user-1',
      price: amount,
      category: categoryId,
    });

    expect(newProduct).toBeInstanceOf(Product);
    expect(newProduct.category.toString()).toEqual('category-1');
    expect(newProduct.ownerId.toString()).toEqual('user-1');
    expect(newProduct.price.amount).toEqual(amount);
  });

  it('should not be able to create a new product with invalid price', () => {
    expect(() => {
      makeProductFactory({
        ownerId: 'user-1',
        price: -1.99,
        category: 'category-1',
      });
    }).toThrowError(NegativeAmountError);
  });
});
