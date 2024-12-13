import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsBoolean,
    IsOptional,
    IsNumber,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';

export class CreateProductDto {
    @ApiProperty({
        description: 'The ID of the user who owns the product',
        example: '12345',
    })
    userId?: string;

    @ApiProperty({
        description: 'The name of the product',
        example: 'Organic Shampoo',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    productName: string;

    @ApiProperty({
        description: 'The brand of the product',
        example: 'Herbal Essences',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    brand: string;

    @ApiProperty({
        description: 'The type/category of the product',
        example: 'Shampoo',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    type: string;

    @ApiProperty({
        description: 'Whether the product applies to standout selling',
        example: true,
        default: false,
    })
    @IsOptional()
    applyStandOutSelling?: boolean;

    @ApiProperty({
        description: 'Whether the product applies to professional selling',
        example: false,
        default: false,
    })
    @IsOptional()
    applyProfessionallySelling?: boolean;

    @ApiProperty({
        description: 'The state or condition of the product',
        example: 'New',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    state?: string;

    @ApiProperty({
        description: 'The price of the product in cents',
        example: 1999,
    })
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        description: 'The available quantity of the product',
        example: 100,
    })
    @IsNotEmpty()
    quantity: number;

    @ApiProperty({
        description: 'The cost of posting the product ',
        example: 500,
    })
    postingCost: number;

    @ApiProperty({ description: 'The number of items sold', example: 20 })
    @IsOptional()
    @IsInt()
    @Min(0)
    soldQuantity: number;

    @ApiProperty({
        description: 'The discount applied to the product in cents',
        example: 200,
        required: false,
    })
    @IsOptional()
    discount: number;

    @ApiProperty({
        description: 'The color of the product',
        example: 'Red',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    color: string;

    @ApiProperty({
        description: 'The size of the product in specific units (e.g., inches)',
        example: 10.5,
        required: false,
    })
    @IsOptional()
    size: number;

    @ApiProperty({
        description: 'The weight of the product in grams',
        example: 500,
        required: false,
    })
    @IsOptional()
    weight: number;

    @ApiProperty({
        description: 'The average star rating of the product',
        example: 4.5,
        required: false,
    })
    @IsOptional()
    avgStar: number;

    @ApiProperty({
        description: 'A detailed description of the product',
        example: 'A sulfate-free shampoo for dry and damaged hair',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description: string;
}
