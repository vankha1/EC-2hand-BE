import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './users.schema';
import { Type } from 'class-transformer';
import { Product } from './product.schema';

export type SingleOrderDocument = SingleOrder & Document;
@Schema({ timestamps: true })
export class SingleOrder{
    @ApiProperty({
        description: 'Quantity want to buy of the product',
        example: 5,
        default: 1 
    })
    @Prop({ required: true})
    quantity: number;

    @ApiProperty({
        description: 'State of document',
        example: true,
        default: false
    })
    @Prop()
    isDeleted: boolean
    
    @ApiProperty({
        description: 'Does the order use insurance',
        example: true,
        default: false
    })
    @Prop()
    useInsurance: boolean;

    @ApiProperty({
        description: 'Is the order added to the cart',
        example: false,
        default: false
    })
    @Prop()
    addedToCart: boolean;

    @Prop({ type: Types.ObjectId, ref: User.name })
    @Type(() => User)
    userId: string; 

    @Prop({ type: Types.ObjectId, ref: Product.name })
    @Type(() => User)
    productId: string; 

    
}
