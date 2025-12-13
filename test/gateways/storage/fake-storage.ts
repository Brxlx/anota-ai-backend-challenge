import { Storage } from '@/domain/application/shared/gateways/storage.gateway';

export class FakeStorage implements Storage {
  private storage: Map<string, string[]> = new Map();

  async save(topic: string, message: string): Promise<string> {
    if (!this.storage.has(topic)) {
      this.storage.set(topic, []);
    }
    this.storage.get(topic)!.push(message);
    return Promise.resolve('Message saved');
  }

  async get(topic: string): Promise<string> {
    const messages = this.storage.get(topic) || [];
    return Promise.resolve(messages.join('\n'));
  }
}
