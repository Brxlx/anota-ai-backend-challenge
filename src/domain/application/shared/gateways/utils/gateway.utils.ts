import { Category } from '@/domain/enterprise/entities/category';
import { Product } from '@/domain/enterprise/entities/product';

import { Queue } from '../queue.gateway';
import { Storage } from '../storage.gateway';

export class GatewayUtils {
  static async sendCategoryMessageToQueue(queue: Queue, topic: string, category: Category): Promise<void> {
    const response = await queue.produce(
      topic,
      JSON.stringify({
        categoryId: category.id.toString(),
        ownerId: category.ownerId.toString(),
        title: category.title,
        description: category.description,
      }),
    );

    if (response.isLeft()) {
      console.log(`Got error: ${response.value}`);
      throw new Error(`Cagou. ${response.value}`);
    }
  }

  static async saveProductMessageToQueue(queue: Queue, topic: string, product: Product): Promise<void> {
    try {
      await queue.produce(
        topic,
        JSON.stringify({
          productId: product.id.toString(),
          title: product.title,
          description: product.description,
          ownerId: product.ownerId.toString(),
          price: product.price.amount,
          categoryId: product.category.toString(),
          createdAt: product.createdAt,
          type: 'PRODUCT',
        }),
      );
    } catch {
      console.error('Failed to send message to queue');
    }
  }

  static async saveCategoryMessageToStorage(
    storage: Storage,
    topic: string,
    category: Category,
  ): Promise<void> {
    try {
      await storage.save(
        topic,
        JSON.stringify({
          categoryId: category.id.toString(),
          ownerId: category.ownerId.toString(),
          title: category.title,
          description: category.description,
        }),
      );
    } catch {
      console.error('Failed to save category message to storage');
    }
  }

  static async saveProductMessageToStorage(storage: Storage, topic: string, product: Product): Promise<void> {
    try {
      await storage.save(
        topic,
        JSON.stringify({
          productId: product.id.toString(),
          title: product.title,
          description: product.description,
          ownerId: product.ownerId.toString(),
          price: product.price.amount,
          categoryId: product.category.toString(),
          createdAt: product.createdAt,
          type: 'PRODUCT',
        }),
      );
    } catch {
      console.error('Failed to save product message to storage');
    }
  }
}
