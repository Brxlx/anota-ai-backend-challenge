import { Injectable } from '@nestjs/common';

import { ProductsRepository } from '@/domain/application/Product/repositories/products.repository';
import { FindProductsUseCase } from '@/domain/application/Product/use-cases/find-products-use-case';

@Injectable()
export class ListProductsService extends FindProductsUseCase {
  constructor(productsRepository: ProductsRepository) {
    super(productsRepository);
  }
}
