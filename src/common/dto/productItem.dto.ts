import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProductItemDto {
    @ApiProperty({ description: 'Product ID', example: '12345' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ description: 'Price per item', example: 29.99 })
    @IsNotEmpty()
    price: number;

    @ApiProperty({ description: 'Quantity', example: 2 })
    @IsNotEmpty()
    quantity?: number;

    @ApiProperty({ description: 'Does the order use insurance', example: true })
    @IsNotEmpty()
    useInsurance: boolean;
}
