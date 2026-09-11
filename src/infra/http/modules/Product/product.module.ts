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
import { UpdateProductController } from './Update/update-product.controller';
import { UpdateProductService } from './Update/update-product.service';

@Module({
  imports: [DatabaseModule, QueueModule, StorageModule],
  controllers: [
    CreateProductController,
    DeleteProductByIdController,
    FindProductByIdController,
    UpdateProductController,
  ],
  providers: [CreateProductService, DeleteProductByIdService, FindProductByIdService, UpdateProductService],
  exports: [CreateProductService, DeleteProductByIdService, FindProductByIdService, UpdateProductService],
})
export class ProductModule {}
