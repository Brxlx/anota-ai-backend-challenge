import { makeCategoryFactory } from 'test/factories/make-category.factory';
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories.repository';

import { ID } from '@/core/entities/id';

import { InvalidOwnerIdError } from '../errors/invalid-owner-id.error';
import { UpdateCategoryUseCase } from './update-category-use-case';

let categoriesRepository: InMemoryCategoriesRepository;

/**
 * System Under Test (SUT)
 */
let sut: UpdateCategoryUseCase;

suite('[Category][UseCase]', () => {
  /*
   * IMPORTANT: Put beforeAch after suite() to avoid memory leak or cleanup errors if in describe() below.
   */
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository();
    sut = new UpdateCategoryUseCase(categoriesRepository);
  });
  describe('Update Category', () => {
    it('should be able to update title and description from Category', async () => {
      const newCategory = makeCategoryFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      await categoriesRepository.create(newCategory);

      expect(categoriesRepository.items).toHaveLength(1);

      const result = await sut.execute(newCategory.id.toValue(), {
        title: newCategory.title,
        description: 'New description',
        ownerId: newCategory.ownerId.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.category).toBeDefined();
      expect(result.value.category.description).toBe(newCategory.description);
      expect(result.value.category.ownerId.toValue()).toBe(newCategory.ownerId.toValue());
      expect(result.value.category.updatedAt).toBeDefined();
      expect(categoriesRepository.items).toHaveLength(1);
    });

    it('should be able to update ownwerId from Category', async () => {
      const newCategory = makeCategoryFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      await categoriesRepository.create(newCategory);

      expect(categoriesRepository.items).toHaveLength(1);

      const newOwnerId = new ID();

      const result = await sut.execute(newCategory.id.toValue(), {
        ownerId: newOwnerId.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.category).toBeDefined();
      expect(result.value.category.ownerId.toValue()).toBe(newOwnerId.toValue());
      expect(categoriesRepository.items).toHaveLength(1);
    });

    it('should throw error creating Category with invalid ownerId', async () => {
      const newCategory = makeCategoryFactory({
        title: 'Jacket',
        description: 'A nice jacket',
        ownerId: new ID('121d446809ef'),
      });

      await categoriesRepository.create(newCategory);

      const result = await sut.execute(newCategory.id.toValue(), {
        ownerId: newCategory.ownerId.toValue(),
      });

      expect(result.isLeft()).toBeTruthy();
      assert(result.isLeft()); // TypeScript now knows that result is Left

      expect(result.value).toBeInstanceOf(InvalidOwnerIdError);
    });
  });
});
