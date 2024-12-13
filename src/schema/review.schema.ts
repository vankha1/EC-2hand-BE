import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { User } from './users.schema';
import { Product } from './product.schema';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: User.name })
    @Type(() => User)
    userId: string;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
    @Type(() => Product)
    productId: string;

    @ApiProperty({ description: 'Review number of star between 1 and 5' })
    @Prop({ min: 1, max: 5 })
    numberOfStar: number;

    @ApiProperty()
    @Prop({ type: String })
    comment: string;

    @ApiProperty({
        description: 'State of document',
        example: true,
        default: false,
    })
    @Prop()
    isDeleted: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
