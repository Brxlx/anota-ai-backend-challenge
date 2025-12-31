import { Module } from '@nestjs/common';

import { EnvModule } from '../shared/env/env.module';
import { CategoryModule } from './modules/Category/category.module';
import { ProductModule } from './modules/Product/product.module';

@Module({
  imports: [EnvModule, CategoryModule, ProductModule],
})
export class HttpModule {}
