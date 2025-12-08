import { makeCategoryFactory } from 'test/factories/make-category.factory';
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories.repository';

import { ID } from '@/core/entities/id';

import { InvalidCategoryIdError } from '../errors/invalid-category-id.error';
import { FindCategoryByIdUseCase } from './find-category-by-id-use-case';

let categoriesRepository: InMemoryCategoriesRepository;

/**
 * System Under Test (SUT)
 */
let sut: FindCategoryByIdUseCase;

suite('[Category][UseCase]', () => {
  /*
   * IMPORTANT: Put beforeAch after suite() to avoid memory leak or cleanup errors if in describe() below.
   */
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository();
    sut = new FindCategoryByIdUseCase(categoriesRepository);
  });
  describe('Find Category by ID', () => {
    it('should be able to find a category by id', async () => {
      const newCategory = makeCategoryFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      await categoriesRepository.create(newCategory);

      const result = await sut.execute({
        id: newCategory.id.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.category.id.isValid()).toBeTruthy();
      expect(result.value.category.title).toBe(newCategory.title);
      expect(result.value.category.description).toBe(newCategory.description);
      expect(result.value.category.ownerId.toValue()).toBe(newCategory.ownerId.toValue());
      expect(categoriesRepository.items).toHaveLength(1);
    });

    it('should throw error finding a category with invalid id', async () => {
      makeCategoryFactory(
        {
          title: 'Jacket',
          description: 'A nice jacket',
          ownerId: new ID('121d446809ef'),
        },
        new ID('121d749809ed'),
      );

      const result = await sut.execute({
        id: new ID('non-existing-id').toValue(),
      });

      expect(result.isLeft()).toBeTruthy();
      assert(result.isLeft()); // TypeScript now knows that result is Left

      expect(result.value).toBeInstanceOf(InvalidCategoryIdError);
    });
  });
});
