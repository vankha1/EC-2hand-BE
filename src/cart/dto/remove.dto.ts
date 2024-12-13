import { IsNotEmpty, IsString } from "class-validator";

export class RemoveItemDto {
    @IsNotEmpty()
    @IsString()
    cartId: string;

    @IsNotEmpty()
    @IsString()
    itemId: string;
}
