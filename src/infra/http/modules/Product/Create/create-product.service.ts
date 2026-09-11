import { Injectable } from '@nestjs/common';

import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';
import { CreateProductUseCase } from '@/domain/application/Product/use-cases/create-product-use-case';
import { Queue } from '@/domain/application/shared/gateways/queue.gateway';
import { Storage } from '@/domain/application/shared/gateways/storage.gateway';

@Injectable()
export class CreateProductService extends CreateProductUseCase {
  constructor(productsRepository: ProductsRepository, queue: Queue, storage: Storage) {
    super(productsRepository, queue, storage);
  }
}
