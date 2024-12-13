import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtGuard } from 'src/auth/guard';
import { CreateCartDto } from './dto/create.dto';
import { CurrentUser } from 'src/users/decorator';
import { TCurrentUser } from 'src/types';
import { RemoveItemDto } from './dto/remove.dto';

@ApiTags('carts')
@UseGuards(JwtGuard)
@Controller('carts')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @ApiOperation({ summary: 'Create a new cart' })
    @ApiBody({ description: 'Cart data', type: CreateCartDto })
    @ApiResponse({ status: 201, description: 'Cart successfully created.' })
    @Post()
    async createCart(
        @CurrentUser() user: TCurrentUser,
        @Body() cartData: CreateCartDto,
    ) {
        return this.cartService.createCart(cartData, user._id.toString());
    }

    @ApiOperation({ summary: 'Get all carts' })
    @ApiResponse({ status: 200, description: 'Retrieved all carts.' })
    @Get()
    async getCarts(@CurrentUser() user: TCurrentUser) {
        return this.cartService.getCarts(user._id.toString());
    }

    @ApiOperation({ summary: 'Get an cart by ID' })
    @ApiParam({ name: 'id', description: 'Cart ID' })
    @ApiResponse({ status: 200, description: 'Cart found.' })
    @ApiResponse({ status: 404, description: 'Cart not found.' })
    @Get(':id')
    async getCartById(@Param('id') id: string) {
        return this.cartService.getCartById(id);
    }

    @ApiOperation({ summary: 'Update an cart' })
    @ApiParam({ name: 'id', description: 'Cart ID' })
    @ApiBody({ description: 'Cart status', type: CreateCartDto })
    @ApiResponse({ status: 200, description: 'Cart status updated.' })
    @Patch(':id')
    async updateCartStatus(
        @Param('id') id: string,
        @Body() cartData: CreateCartDto,
    ) {
        return this.cartService.updateCart(id, cartData);
    }

    @ApiOperation({ summary: 'Delete an cart' })
    @ApiBody({ description: 'Cart status', type: RemoveItemDto })
    @ApiResponse({ status: 200, description: 'Cart successfully deleted.' })
    @Delete('item')
    async removeItem(@Body() removeItemDto: RemoveItemDto) {
        const { cartId, itemId } = removeItemDto;
        return this.cartService.removeItemFromCart(cartId, itemId);
    }
}
