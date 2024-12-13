import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { ProductItemDto } from 'src/common/dto/productItem.dto';
import { OrderState, PaymentMethod } from 'src/schema';

export class OrderDto {
    @ApiProperty({
        type: [ProductItemDto],
        description: 'List of items in the order',
        example: [
            {
                productId: '12345',
                quantity: 2,
                price: 29.99,
                useInsurance: true,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductItemDto)
    items: ProductItemDto[];

    @ApiProperty({
        description: 'Payment method',
        enum: PaymentMethod,
        example: PaymentMethod.BANK_TRANSFER,
    })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({
        description: 'Shipping address',
        example: '123 Main St, New York, NY 10001, USA',
    })
    @IsString()
    @IsNotEmpty()
    receivingAddress: string;

    @ApiProperty({
        description: 'Phone number of the recipient',
        example: '+1234567890',
    })
    @IsString()
    @IsNotEmpty()
    receivingPhone: string;

    @ApiProperty({
        description: 'Receiver name',
        example: 'John Doe',
    })
    @IsOptional()
    receiver: string;

    @ApiProperty({
        description: 'Delivery date',
        example: '2024-11-28T01:35:02.85Z',
    })
    @IsDateString()
    deliveryDate: string;

    @ApiProperty({
        description: 'State of the order',
        example: OrderState.ORDERED,
        enum: OrderState,
    })
    @IsOptional()
    @IsEnum(OrderState)
    state: OrderState;
}
