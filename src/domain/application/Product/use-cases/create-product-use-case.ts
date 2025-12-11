import { ID } from '@/core/entities/id';
import { Either, left, right } from '@/core/types/either';
import { Product } from '@/domain/enterprise/entities/product';
import { Price } from '@/domain/enterprise/entities/value-objects/price';

import { InvalidProductIdError } from '../errors/invalid-product-id.error';
import { InvalidProductOwnerIdError } from '../errors/invalid-product-owner-id.error';
import { ProductsRepository } from '../repositories/products.repository';

interface CreateProductUseCaseRequest {
  title: string;
  description: string;
  ownerId: string;
  price: number;
  category: string;
}

type CreateProductUseCaseResponse = Either<InvalidProductIdError, { product: Product }>;

export class CreateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  public async execute({
    title,
    description,
    ownerId,
    price,
    category,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    if (!Product.isValidId(ownerId)) return left(new InvalidProductOwnerIdError());

    const product = Product.create({
      title,
      description,
      ownerId: new ID(ownerId),
      price: Price.createBRL(price),
      category: new ID(category),
    });

    const newProduct = await this.productsRepository.create(product);

    return right({ product: newProduct });
  }
}
