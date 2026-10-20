import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/infra/shared/database/database.module';
import { QueueModule } from '@/infra/shared/gateways/queue/queue.module';
import { StorageModule } from '@/infra/shared/gateways/storage/storage.module';

import { CreateProductController } from './Create/create-product.controller';
import { CreateProductService } from './Create/create-product.service';
import { DeleteProductByIdController } from './Delete/delete-product.controller';
import { DeleteProductByIdService } from './Delete/delete-product.service';
import { FindProductByIdController } from './Find/find-product.controller';
import { FindProductByIdService } from './Find/find-product.service';
import { ListProductsController } from './List/list-products.controller';
import { ListProductsService } from './List/list-products.service';
import { UpdateProductController } from './Update/update-product.controller';
import { UpdateProductService } from './Update/update-product.service';

@Module({
  imports: [DatabaseModule, QueueModule, StorageModule],
  controllers: [
    CreateProductController,
    DeleteProductByIdController,
    FindProductByIdController,
    ListProductsController,
    UpdateProductController,
  ],
  providers: [
    CreateProductService,
    DeleteProductByIdService,
    FindProductByIdService,
    ListProductsService,
    UpdateProductService,
  ],
  exports: [
    CreateProductService,
    DeleteProductByIdService,
    FindProductByIdService,
    ListProductsService,
    UpdateProductService,
  ],
})
export class ProductModule {}
