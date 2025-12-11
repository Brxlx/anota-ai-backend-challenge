import { makeProductFactory } from 'test/factories/make-product.factory';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products.repository';

import { InvalidProductOwnerIdError } from '../errors/invalid-product-owner-id.error';
import { CreateProductUseCase } from './create-product-use-case';

let productsRepository: InMemoryProductsRepository;

/**
 * System Under Test (SUT)
 */
let sut: CreateProductUseCase;

suite('[Product][UseCase]', () => {
  /*
   * IMPORTANT: Put beforeAch after suite() to avoid memory leak or cleanup errors if in describe() below.
   */
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new CreateProductUseCase(productsRepository);
  });
  describe('Create Product', () => {
    it('should be able to create a new Product', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      const result = await sut.execute({
        title: newProduct.title,
        description: newProduct.description,
        ownerId: newProduct.ownerId.toValue(),
        price: newProduct.price.amount,
        category: newProduct.category.toString(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.product.title).toBe(newProduct.title);
      expect(result.value.product.description).toBe(newProduct.description);
      expect(result.value.product.ownerId.toValue()).toBe(newProduct.ownerId.toValue());
      expect(result.value.product.price.amount).toEqual(newProduct.price.amount);
      expect(result.value.product.category.toString()).toEqual(newProduct.category.toString());
      expect(productsRepository.items).toHaveLength(1);
    });

    it('should throw error creating Category with ivalid ownerId', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
        ownerId: '121d446809ef',
      });

      const result = await sut.execute({
        title: newProduct.title,
        description: newProduct.description,
        ownerId: newProduct.ownerId.toValue(),
        price: newProduct.price.amount,
        category: newProduct.category.toString(),
      });

      expect(result.isLeft()).toBeTruthy();
      assert(result.isLeft()); // TypeScript now knows that result is Left

      expect(result.value).toBeInstanceOf(InvalidProductOwnerIdError);
    });
  });
});
