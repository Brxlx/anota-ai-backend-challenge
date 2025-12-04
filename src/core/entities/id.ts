import { ObjectId } from 'bson';

export class ID {
  private value: string;

  toString() {
    return this.value;
  }

  toValue() {
    return this.value;
  }

  private generateId(): string {
    return new ObjectId().toHexString();
  }

  constructor(value?: string) {
    this.value = value ?? this.generateId();
  }

  public equals(id: ID): boolean {
    return id.toValue() === this.value;
  }

  public isValid(): boolean {
    return ObjectId.isValid(this.value);
  }
}
