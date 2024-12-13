import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty()
    userId: string;

    @IsNotEmpty()
    @ApiProperty()
    productId: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    numberOfStar?: number;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    comment?: string;
}
