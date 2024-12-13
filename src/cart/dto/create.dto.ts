import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ProductItemDto } from 'src/common/dto/productItem.dto';


export class CreateCartDto {
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
}
