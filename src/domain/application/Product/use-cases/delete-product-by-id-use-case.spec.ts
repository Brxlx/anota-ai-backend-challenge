import { makeProductFactory } from 'test/factories/make-product.factory';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products.repository';

import { ID } from '@/core/entities/id';

import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { DeleteProductByIdUseCase } from './delete-product-by-id-use-case';

let productsRepository: InMemoryProductsRepository;

/**
 * System Under Test (SUT)
 */
let sut: DeleteProductByIdUseCase;

suite('[Category][UseCase]', () => {
  /*
   * IMPORTANT: Put beforeAch after suite() to avoid memory leak or cleanup errors if in describe() below.
   */
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    sut = new DeleteProductByIdUseCase(productsRepository);
  });
  describe('Delete Category by ID', () => {
    it('should be able to delete a category by id', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
        price: 12.99,
      });

      await productsRepository.create(newProduct);

      expect(productsRepository.items).toHaveLength(1);

      const result = await sut.execute({
        id: newProduct.id.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value).toBeNull();
      expect(productsRepository.items).toHaveLength(0);
    });

    it('should throw error finding a category with invalid id', async () => {
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
