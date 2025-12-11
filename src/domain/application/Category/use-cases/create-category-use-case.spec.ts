import { makeCategoryFactory } from 'test/factories/make-category.factory';
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories.repository';

import { InvalidCategoryOwnerIdError } from '../errors/invalid-category-owner-id.error';
import { CreateCategoryUseCase } from './create-category-use-case';

let categoriesRepository: InMemoryCategoriesRepository;

/**
 * System Under Test (SUT)
 */
let sut: CreateCategoryUseCase;

suite('[Category][UseCase]', () => {
  /*
   * IMPORTANT: Put beforeAch after suite() to avoid memory leak or cleanup errors if in describe() below.
   */
  beforeEach(() => {
    categoriesRepository = new InMemoryCategoriesRepository();
    sut = new CreateCategoryUseCase(categoriesRepository);
  });
  describe('Create Category', () => {
    it('should be able to create a new Regular Wallet', async () => {
      const newCategory = makeCategoryFactory({
        title: 'Jacket',
        description: 'A nice jacket',
      });

      const result = await sut.execute({
        title: newCategory.title,
        description: newCategory.description,
        ownerId: newCategory.ownerId.toValue(),
      });

      expect(result.isRight()).toBeTruthy();
      assert(result.isRight()); // TypeScript now knows that result is Right

      expect(result.value.category.title).toBe(newCategory.title);
      expect(result.value.category.description).toBe(newCategory.description);
      expect(result.value.category.ownerId.toValue()).toBe(newCategory.ownerId.toValue());
      expect(categoriesRepository.items).toHaveLength(1);
    });

    it('should throw error creating Category with ivalid ownerId', async () => {
      const newCategory = makeCategoryFactory({
        title: 'Jacket',
        description: 'A nice jacket',
        ownerId: '121d446809ef',
      });

      const result = await sut.execute({
        title: newCategory.title,
        description: newCategory.description,
        ownerId: newCategory.ownerId.toValue(),
      });

      expect(result.isLeft()).toBeTruthy();
      assert(result.isLeft()); // TypeScript now knows that result is Left

      expect(result.value).toBeInstanceOf(InvalidCategoryOwnerIdError);
    });
  });
});
