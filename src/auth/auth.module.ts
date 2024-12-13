import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../users';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';
import { MailModule } from '../mailer/mailer.module';

@Module({
  imports: [
    UserModule,
    MailModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get<string>('secret'),
          signOptions: {
            expiresIn: config.get<string>('expired'),
          },
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
