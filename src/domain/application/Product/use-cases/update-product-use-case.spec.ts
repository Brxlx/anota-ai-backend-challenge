import { makeProductFactory } from 'test/factories/make-product.factory';
import { FakeQueue } from 'test/gateways/queue/fake-queue';
import { FakeStorage } from 'test/gateways/storage/fake-storage';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products.repository';

import { ID } from '@/core/entities/id';

import { InvalidProductOwnerIdError } from '../errors/invalid-product-owner-id.error';
import { UpdateProductUseCase } from './update-product-use-case';

let productsRepository: InMemoryProductsRepository;

/**
 * System Under Test (SUT)
 */
let sut: UpdateProductUseCase;
let queue: FakeQueue;
let storage: FakeStorage;

suite('[Product][UseCase]', () => {
  /*
   * IMPORTANT: Put beforeAch after suite() to avoid memory leak or cleanup errors if in describe() below.
   */
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository();
    queue = new FakeQueue();
    storage = new FakeStorage();
    sut = new UpdateProductUseCase(productsRepository, queue, storage);
  });
  describe('Update Product', () => {
    it('should be able to update title and description from Product', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      await productsRepository.create(newProduct);

      expect(productsRepository.items).toHaveLength(1);

      const result = await sut.execute(newProduct.id.toValue(), {
        title: newProduct.title,
        description: 'New description',
        ownerId: newProduct.ownerId.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.product).toBeDefined();
      expect(result.value.product.description).toBe(newProduct.description);
      expect(result.value.product.ownerId.toValue()).toBe(newProduct.ownerId.toValue());
      expect(result.value.product.updatedAt).toBeDefined();
      expect(productsRepository.items).toHaveLength(1);
    });

    it('should be able to update ownwerId from Product', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      await productsRepository.create(newProduct);

      expect(productsRepository.items).toHaveLength(1);

      const newOwnerId = new ID();

      const result = await sut.execute(newProduct.id.toValue(), {
        ownerId: newOwnerId.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.product).toBeDefined();
      expect(result.value.product.ownerId.toValue()).toBe(newOwnerId.toValue());
      expect(productsRepository.items).toHaveLength(1);
    });

    it('should throw error creating Product with invalid ownerId', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
        ownerId: '121d446809ef',
      });

      await productsRepository.create(newProduct);

      const result = await sut.execute(newProduct.id.toValue(), {
        ownerId: newProduct.ownerId.toValue(),
      });

      expect(result.isLeft()).toBeTruthy();
      assert(result.isLeft()); // TypeScript now knows that result is Left

      expect(result.value).toBeInstanceOf(InvalidProductOwnerIdError);
    });
  });
});
