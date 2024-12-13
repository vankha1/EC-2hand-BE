import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ProductItemDto } from 'src/common/dto/productItem.dto';
import { User } from './users.schema';

export enum OrderState {
    ORDERED = 'Đơn hàng đã được đặt',
    PACKED = 'Đóng gói sản phẩm',
    DELIVERING = 'Đang trên đường giao',
    DELIVERED = 'Đã giao thành công',
}

export enum PaymentMethod {
    BANK_TRANSFER = 'Chuyển khoản ngân hàng',
    CASH = 'Thanh toán tiền mặt khi nhận hàng',
}

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
    @ApiProperty({
        description: 'State of the order',
        example: OrderState.ORDERED,
    })
    @Prop({ default: OrderState.ORDERED })
    state: OrderState;

    @ApiProperty({
        description: 'State of document',
        example: true,
        default: false,
    })
    @Prop()
    isDeleted: boolean;

    @ApiProperty({
        description: 'Payment method',
        example: PaymentMethod.BANK_TRANSFER,
        default: PaymentMethod.BANK_TRANSFER,
    })
    @Prop()
    paymentMethod: PaymentMethod;

    @ApiProperty({
        description: 'Order code',
        example: '123456',
    })
    @Prop({ required: true })
    orderCode: string;

    @ApiProperty({
        description: 'Payment state',
        example: false,
        default: false,
    })
    @Prop({ default: false })
    paymentState: boolean;

    @ApiProperty({
        description: 'Total price of the order',
        example: 20000,
    })
    @Prop()
    totalPrice: number;

    @Prop()
    listOfSingleOrder: ProductItemDto[];

    @ApiProperty({
        description: 'Shipping address',
        example: '123 Main St, New York, NY 10001, USA',
    })
    @Prop({ required: true })
    receivingAddress: string;

    @ApiProperty({
        description: 'Phone number of the recipient',
        example: '0987654321',
    })
    @Prop({ required: true })
    receivingPhone: string;

    @ApiProperty({
        description: 'Receiver name',
        example: 'John Doe',
    })
    @Prop()
    receiver: string;

    @Prop({ type: Types.ObjectId, ref: User.name })
    @Type(() => User)
    userId: string;

    @ApiProperty({ type: Date, description: 'Delivery date', required: false })
    @Prop()
    deliveryDate?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
