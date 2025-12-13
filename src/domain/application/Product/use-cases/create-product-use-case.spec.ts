// import { FakeEnv } from 'test/env/fake-env';
import { makeProductFactory } from 'test/factories/make-product.factory';
import { FakeQueue } from 'test/gateways/queue/fake-queue';
import { FakeStorage } from 'test/gateways/storage/fake-storage';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products.repository';

import { DomainEvents } from '../../shared/events/domain-events';
import { InvalidProductOwnerIdError } from '../errors/invalid-product-owner-id.error';
import { SendToQueueError } from '../errors/send-to-queue.error';
import { SendToStorageError } from '../errors/send-to-storage.error';
import { CreateProductUseCase } from './create-product-use-case';

// let env: FakeEnv;
let productsRepository: InMemoryProductsRepository;
let queue: FakeQueue;
let storage: FakeStorage;
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
    // env = new FakeEnv();
    queue = new FakeQueue();
    storage = new FakeStorage();
    sut = new CreateProductUseCase(productsRepository, queue, storage);
  });
  describe('Create Product', () => {
    it('should be able to create a new Product', async () => {
      const spy = vi.spyOn(DomainEvents, 'dispatchEventsForAggregate');

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

      const messageSentToQueue = await queue.consume('catalog-emit');

      const storageValue = await storage.get('catalog-emit');

      console.log('storageValue', storageValue);

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.product.title).toBe(newProduct.title);
      expect(result.value.product.description).toBe(newProduct.description);
      expect(result.value.product.ownerId.toValue()).toBe(newProduct.ownerId.toValue());
      expect(result.value.product.price.amount).toEqual(newProduct.price.amount);
      expect(result.value.product.category.toString()).toEqual(newProduct.category.toString());
      expect(productsRepository.items).toHaveLength(1);
      expect(messageSentToQueue).toBeDefined();
      expect(storageValue).toBeDefined();
      expect(spy).toHaveBeenCalled();
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

    it('should throw error if queue fails', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      // Simula falha na fila
      vi.spyOn(queue, 'produce').mockImplementationOnce(() => {
        throw new SendToQueueError();
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

      expect(result.value).toBeInstanceOf(SendToQueueError);
    });

    it('should throw error if storage fails', async () => {
      const newProduct = makeProductFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      // Simula falha no storage
      vi.spyOn(storage, 'save').mockImplementationOnce(() => {
        throw new Error('Storage error');
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

      expect(result.value).toBeInstanceOf(SendToStorageError);
    });
  });
});
