import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from '../schema';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        ProductModule
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule {}
