import { IsObject, IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class ProductQuery extends PaginationDto {
    @IsOptional()
    @IsObject()
    matches: Record<string, any>; // Filter conditions (e.g., { isDel: false })
}