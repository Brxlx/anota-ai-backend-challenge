import { Injectable } from '@nestjs/common';

import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';
import { FindProductByIdUseCase } from '@/domain/application/Product/use-cases/find-product-by-id-use-case';

@Injectable()
export class FindProductByIdService extends FindProductByIdUseCase {
  constructor(productsRepository: ProductsRepository) {
    super(productsRepository);
  }
}
