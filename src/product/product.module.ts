import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schema/product.schema';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CloudinaryModule, CloudinaryService } from '../cloudinary';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CloudinaryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CloudinaryService],
  exports: [ProductService]
})
export class ProductModule {}