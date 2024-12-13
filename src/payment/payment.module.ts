import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigService } from '@nestjs/config';
import PayOS from '@payos/node';
import { OrderModule } from 'src/order/order.module';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: PayOS,
      useFactory: async (config: ConfigService) => {
        return new PayOS(
          config.get<string>('payos_client_id'),
          config.get<string>('payos_api_key'),
          config.get<string>('payos_checksum_key'),
        );
      },
      inject: [ConfigService],
    },
  ],
  imports: [OrderModule],
  exports: [PaymentService],
})
export class PaymentModule {}