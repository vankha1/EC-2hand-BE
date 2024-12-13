import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Document, Types } from 'mongoose';
import { User } from './users.schema';
import { ProductItemDto } from 'src/common/dto/productItem.dto';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
    @Prop({ type: Types.ObjectId, ref: User.name })
    @Type(() => User)
    userId: string;

    @ApiProperty({
        type: [ProductItemDto],
        description: 'List of items in the cart',
    })
    @Prop([
        {
            productId: { type: Types.ObjectId, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 },
            useInsurance: { type: Boolean, default: false },
        },
    ])
    productItems: ProductItemDto[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
