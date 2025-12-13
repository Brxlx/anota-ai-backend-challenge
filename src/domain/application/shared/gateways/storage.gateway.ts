export abstract class Storage {
  abstract save(topic: string, message: string): Promise<string>;
  abstract get(topic: string): Promise<string>;
}
