import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';

import { InvalidOwnerIdError } from '../errors/invalid-owner-id.error';
import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { ProductsRepository } from '../repositories/products.repository';

interface UpdateProductUseCaseRequest {
  title?: string;
  description?: string;
  ownerId?: string;
  price?: number;
  category?: string;
}

type UpdateProductUseCaseResponse = Either<InvalidProductIdError | InvalidOwnerIdError, { product: Product }>;

export class UpdateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(
    id: string,
    { title, description, ownerId, price, category }: UpdateProductUseCaseRequest,
  ): Promise<UpdateProductUseCaseResponse> {
    const product = await this.productsRepository.findById(id);

    if (!product) return left(new InvalidProductIdError());

    if (ownerId && !Product.isValidId(ownerId)) return left(new InvalidOwnerIdError());

    if (title !== undefined) product.setTitle(title);

    if (description !== undefined) product.setDescription(description);

    if (ownerId !== undefined) product.setOwnerId(new ID(ownerId));

    if (price !== undefined) product.setPrice(price);

    if (category !== undefined) product.setCategory(category);

    await this.productsRepository.update(product);

    return right({ product });
  }
}
