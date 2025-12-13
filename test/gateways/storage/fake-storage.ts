/* eslint-disable @typescript-eslint/require-await */
import { Either, left, right } from '@/core/types/either';
import { Storage } from '@/domain/application/shared/gateways/storage.gateway';

export class FakeStorage implements Storage {
  private storage: Map<string, string[]> = new Map();

  async save(topic: string, message: string): Promise<Either<Error, string>> {
    try {
      if (!this.storage.has(topic)) {
        this.storage.set(topic, []);
      }
      this.storage.get(topic)!.push(message);
      return right('Message saved');
    } catch {
      return left(new Error('Error saving message to storage'));
    }
  }

  async get(topic: string): Promise<Either<Error, string>> {
    try {
      const messages = this.storage.get(topic) || [];
      return right(messages.join('\n'));
    } catch {
      return left(new Error('Error getting messages from storage'));
    }
  }
}
