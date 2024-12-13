import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PayOS from '@payos/node';

@Injectable()
export class PaymentService {
    constructor(
        private readonly payos: PayOS,
        private readonly configService: ConfigService,
    ) {}

    async createPaymentLink(orderCode: number, amount: number) {
        const order = {
            amount: amount,
            description: 'SecondHand Payment',
            orderCode: orderCode,
            returnUrl: this.configService.get<string>('redirect_url_success'), // Redirect to this URL after payment
            cancelUrl: this.configService.get<string>('redirect_url_cancel'), // Redirect to this URL after payment is cancelled
            expiredAt: Math.floor((Date.now() + 600000) / 1000), // 10 minutes
        };
        const paymentLink = await this.payos.createPaymentLink(order);
        return paymentLink.checkoutUrl;
    }

    verifyPayment(webhookData: any) {
        return this.payos.verifyPaymentWebhookData(webhookData);
    }
}
