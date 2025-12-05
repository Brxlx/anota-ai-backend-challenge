import { ID } from '@/core/entities/id';

import { Category } from './category';

describe('[Category]', () => {
  it('should be able to create a new category', () => {
    const newCategory = Category.create({
      title: 'test',
      description: 'This is the test description',
      ownerId: new ID('user1'),
    });

    expect(newCategory).toBeInstanceOf(Category);
    expect(newCategory.title).toEqual('test');
    expect(newCategory.description).toEqual('This is the test description');
    expect(newCategory.ownerId.toString()).toEqual('user1');
  });

  it('should be able to create a new category with a specific createdAt date', () => {
    const specificDate = new Date('2025-01-01T00:00:00Z');
    const newCategory = Category.create({
      title: 'test',
      description: 'This is the test description',
      ownerId: new ID('user1'),
      createdAt: specificDate,
    });

    expect(newCategory.createdAt).toEqual(specificDate);
  });
});
