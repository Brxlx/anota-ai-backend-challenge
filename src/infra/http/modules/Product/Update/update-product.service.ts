import { Injectable } from '@nestjs/common';

import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';
import { UpdateProductUseCase } from '@/domain/application/Product/use-cases/update-product-use-case';
import { Queue } from '@/domain/application/shared/gateways/queue.gateway';
import { Storage } from '@/domain/application/shared/gateways/storage.gateway';

@Injectable()
export class UpdateProductService extends UpdateProductUseCase {
  constructor(productsRepository: ProductsRepository, queue: Queue, storage: Storage) {
    super(productsRepository, queue, storage);
  }
}
