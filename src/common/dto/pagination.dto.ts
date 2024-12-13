import { IsInt, IsOptional } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsInt()
    page?: number = 1; // Current page

    @IsOptional()
    @IsInt()
    limit: number = 10; // Items per page

    @IsOptional()
    sort: Record<string, 1 | -1>; // Sorting criteria (e.g., { price: 1 })
}
