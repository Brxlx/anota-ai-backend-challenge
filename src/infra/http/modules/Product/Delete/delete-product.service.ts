import { Injectable } from '@nestjs/common';

import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';
import { DeleteProductByIdUseCase } from '@/domain/application/Product/use-cases/delete-product-by-id-use-case';
import { Queue } from '@/domain/application/shared/gateways/queue.gateway';

@Injectable()
export class DeleteProductByIdService extends DeleteProductByIdUseCase {
  constructor(productsRepository: ProductsRepository, queue: Queue) {
    super(productsRepository, queue);
  }
}
