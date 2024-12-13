import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { CurrentUser } from 'src/users/decorator';
import { OrderDto } from './dto/order.dto';
import { OrderService } from './order.service';
import { TCurrentUser } from 'src/types';
import { OrderState } from 'src/schema';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @ApiOperation({ summary: 'Create a new order' })
    @ApiBody({ description: 'Order data', type: OrderDto })
    @ApiResponse({ status: 201, description: 'Order successfully created.' })
    @Post()
    async createOrder(
        @CurrentUser() user: TCurrentUser,
        @Body() orderData: OrderDto,
    ) {
        return this.orderService.createOrder(orderData, user._id.toString());
    }

    @ApiOperation({ summary: 'Get all orders' })
    @ApiResponse({ status: 200, description: 'Retrieved all orders.' })
    @Get('all')
    async getAllOrders() {
        return this.orderService.getAllOrders();
    }

    @ApiOperation({ summary: 'Get all orders' })
    @ApiResponse({ status: 200, description: 'Retrieved all orders.' })
    @UseGuards(JwtGuard)
    @Get()
    async getOrders(@CurrentUser() user: TCurrentUser) {
        return this.orderService.getOrders(user._id.toString());
    }

    @ApiOperation({ summary: 'Get an order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order found.' })
    @ApiResponse({ status: 404, description: 'Order not found.' })
    @Get(':id')
    async getOrderById(@Param('id') id: string) {
        return this.orderService.getOrderById(id);
    }

    @ApiOperation({ summary: 'Update order state' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiBody({ description: 'Order state'})
    @ApiResponse({ status: 200, description: 'Order state updated.' })
    @Post(':id/state')
    async updateOrderState(@Param('id') id: string, @Body() body: { state: OrderState }) {
        return this.orderService.updateOrderStatus(id, body.state);
    }
}
