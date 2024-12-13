import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./users.schema";
import { Type } from "class-transformer";
import { Types } from "mongoose";
export type PaymentMethodDocument = PaymentMethod & Document;
@Schema({ timestamps: true })
export class PaymentMethod {
    @ApiProperty({
        description: 'The name on card',
        example: 'NGUYEN MINH DIEM',
    })
    @Prop({ required: true })
    name: string;

    @ApiProperty({
        description: 'The card number',
        example: '123456789',
    })
    @Prop({ required: true })
    cardNumber: string;

    @ApiProperty({
        description: 'State of document',
        example: true,
        default: false
    })
    @Prop()
    isDeleted: boolean
    
    @ApiProperty({
        description: 'The expiration month of the card',
        example: 12,
    })
    @Prop({ required: true })
    expirationMonth: number;

    @ApiProperty({
        description: 'The expiration year of the card',
        example: 2023,
    })
    @Prop({ required: true })
    expirationYear: number;

    @Prop({ type: Types.ObjectId, ref: User.name })
    @Type(() => User)
    userId: string;

}