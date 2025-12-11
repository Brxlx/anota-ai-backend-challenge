import { makeProductFactory } from 'test/factories/make-product.factory';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products.repository';

import { ID } from '@/core/entities/id';

import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { FindProductByIdUseCase } from './find-product-by-id-use-case';

let productsRepository: InMemoryProductsRepository;

/**
 * System Under Test (SUT)
 */
let sut: FindProductByIdUseCase;

suite('[Product][UseCase]', () => {
  /*
   * IMPORTANT: Put beforeAch after suite() to avoid memory leak or cleanup errors if in describe() below.
   */
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new FindProductByIdUseCase(productsRepository);
  });
  describe('Find Product by ID', () => {
    it('should be able to find a category by id', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
        price: 1.99,
        category: 'category-test',
      });

      await productsRepository.create(newProduct);

      const result = await sut.execute({
        id: newProduct.id.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.product.id.isValid()).toBeTruthy();
      expect(result.value.product.title).toBe(newProduct.title);
      expect(result.value.product.description).toBe(newProduct.description);
      expect(result.value.product.ownerId.toValue()).toBe(newProduct.ownerId.toValue());
      expect(result.value.product.price.amount).toBe(newProduct.price.amount);
      expect(productsRepository.items).toHaveLength(1);
    });

    it('should throw error finding a product with invalid id', async () => {
      makeProductFactory(
        {
          title: 'Jacket',
          description: 'A nice jacket',
          ownerId: '121d446809ef',
        },
        new ID('121d749809ed'),
      );

      const result = await sut.execute({
        id: 'non-existing-id',
      });

      expect(result.isLeft()).toBeTruthy();
      assert(result.isLeft()); // TypeScript now knows that result is Left

      expect(result.value).toBeInstanceOf(InvalidProductIdError);
    });
  });
});
