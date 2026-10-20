import { makeProductFactory } from 'test/factories/make-product.factory';
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products.repository';

import { ID } from '@/core/entities/id';
import { Product } from '@/domain/enterprise/entities/product';

import { InvalidPaginationCursorError } from '../errors/invalid-pagination-cursor.error';
import { FindProductsUseCase } from './find-products-use-case';

let productsRepository: InMemoryProductsRepository;

/**
 * System Under Test (SUT)
 */
let sut: FindProductsUseCase;

// IDs determinísticos (hex de ObjectId válido) só para controlar a ordem
// nos testes — comparação lexicográfica de hex equivale à ordem
// cronológica real de um ObjectId.
const ids = Array.from({ length: 5 }, (_, i) => new ID(String(i + 1).padStart(24, '0')));

suite('[Product][UseCase]', () => {
  beforeEach(async () => {
    productsRepository = new InMemoryProductsRepository();
    sut = new FindProductsUseCase(productsRepository);

    for (const id of ids) {
      await productsRepository.create(makeProductFactory({ title: `Product ${id.toValue()}` }, id));
    }
  });

  describe('List Products', () => {
    it('should return the first page respecting `limit` and a `nextCursor`', async () => {
      const result = await sut.execute({ limit: 2 });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight());

      expect(result.value.items).toHaveLength(2);
      expect((result.value.items as Product[])[0].id.toValue()).toBe(ids[0].toValue());
      expect((result.value.items as Product[])[1].id.toValue()).toBe(ids[1].toValue());
      expect(result.value.nextCursor).toBe(ids[1].toValue());
    });

    it('should continue from `cursor` on the next page', async () => {
      const firstPage = await sut.execute({ limit: 2 });
      assert(firstPage.isRight());

      const secondPage = await sut.execute({ limit: 2, cursor: firstPage.value.nextCursor! });
      assert(secondPage.isRight());

      expect((secondPage.value.items as Product[])[0].id.toValue()).toBe(ids[2].toValue());
      expect((secondPage.value.items as Product[])[1].id.toValue()).toBe(ids[3].toValue());
    });

    it('should return `nextCursor: null` on the last page', async () => {
      const result = await sut.execute({ limit: 10 });
      assert(result.isRight());

      expect(result.value.items).toHaveLength(5);
      expect(result.value.nextCursor).toBeNull();
    });

    it('should return only the selected fields when `filters` is informed', async () => {
      const result = await sut.execute({ limit: 1, filters: { title: true } });
      assert(result.isRight());

      const [product] = result.value.items;

      expect(product.title).toBeDefined();
      expect(product.description).toBeUndefined();
      expect(product.price).toBeUndefined();
    });

    it('should return `InvalidPaginationCursorError` for a cursor that no longer resolves', async () => {
      const result = await sut.execute({ cursor: new ID().toValue() });

      expect(result.isLeft()).toBeTruthy();
      assert(result.isLeft());
      expect(result.value).toBeInstanceOf(InvalidPaginationCursorError);
    });
  });
});
