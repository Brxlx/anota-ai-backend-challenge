import { makeProductFactory } from 'test/factories/make-product.factory';
import { FakeQueue } from 'test/gateways/queue/fake-queue';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products.repository';

import { ID } from '@/core/entities/id';

import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { DeleteProductByIdUseCase } from './delete-product-by-id-use-case';

let productsRepository: InMemoryProductsRepository;
let queue: FakeQueue;

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
    queue = new FakeQueue();
    sut = new DeleteProductByIdUseCase(productsRepository, queue);
  });
  describe('Delete Category by ID', () => {
    it('should be able to delete a category by id', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
        price: 12.99,
      });

      await productsRepository.create(newProduct);

      const anotherProduct = makeProductFactory({
        title: 'Pen',
        description: 'A simple pen',
        price: 2.99,
      });

      await productsRepository.create(anotherProduct);

      expect(productsRepository.items).toHaveLength(2);

      const result = await sut.execute({
        id: newProduct.id.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value).not.toBeNull();
      expect(productsRepository.items).toHaveLength(1);
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
