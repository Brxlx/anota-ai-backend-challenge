import { Module } from '@nestjs/common';

import { CategoryModule } from './modules/Category/category.module';
import { ProductModule } from './modules/Product/product.module';

@Module({
  imports: [CategoryModule, ProductModule],
})
export class HttpModule {}
