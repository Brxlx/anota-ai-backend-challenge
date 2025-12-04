import { ID } from './id';

describe('[ID] Test', () => {
  it('should be able to create a new EntityId', () => {
    const newEntityId = new ID();

    expect(newEntityId).toBeInstanceOf(ID);
  });

  it('should be able to create a new EntityId with specified id', () => {
    const newObjectId = new ID('id-test');
    const anotherObjectId = new ID();

    expect(newObjectId.toValue()).toEqual('id-test');
    expect(anotherObjectId.isValid()).toBeTruthy();
  });

  it('should be able to compare two EntityId', () => {
    const newObjectId = new ID('id-test');
    const anotherObjectId = new ID('id-test');
    expect(newObjectId.equals(anotherObjectId)).toBeTruthy();
  });

  it('should generate a valid ObjectID', () => {
    const newEntityId = new ID();

    expect(newEntityId.isValid()).toBeTruthy();
  });

  it('should throw error with invalid ObjectID generation', () => {
    const newEntityId = new ID('test');

    expect(newEntityId.isValid()).toBeFalsy();
  });
});
