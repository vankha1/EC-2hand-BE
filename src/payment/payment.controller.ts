import { BadRequestException, Controller, Post, Param, Res, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OrderService } from 'src/order/order.service';
import { PaymentMethod } from 'src/schema';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
        private readonly orderService: OrderService,
    ) {}

    @ApiOperation({ summary: 'Webhook for payment verification' })
    @Post('webhook')
    async webhook(@Body() body: any) {
      if(body?.data.orderCode === 123 || body?.desc !== 'success') {
        return 'Invalid payment data.';
      }

      const paymentData = this.paymentService.verifyPayment(body);      
      if(paymentData) {
        await this.orderService.updatePaymentStateByOrderCode(String(paymentData.orderCode), true);
      }
      return { message: 'Payment verified.' };
    }

    @ApiOperation({ summary: 'Create QR Code payment' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 303, description: 'Redirect to QR scan' })
    @ApiResponse({ status: 404, description: 'Order not found.' })
    @ApiResponse({ status: 400, description: 'Invalid payment method.' })
    @Post(':id')
    async pay(@Param('id') id: string) {
      const order = await this.orderService.getOrderById(id);

      if(order.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
        throw new BadRequestException('Invalid payment method.');
      }
      
      const paymentLink = await this.paymentService.createPaymentLink(Number(order.orderCode), Math.round(order.totalPrice));
      return paymentLink;
    }
}
