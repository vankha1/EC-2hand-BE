import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateReviewDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    productId?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    numberOfStar?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    comment?: string;
}
