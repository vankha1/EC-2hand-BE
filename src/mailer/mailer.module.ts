import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mailer.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (config: ConfigService) => {
                const dir = join(__dirname, 'templates');
                
                return {
                    transport: {
                        service: 'gmail',
                        secure: true,
                        auth: {
                            user: config.get('mail_from'),
                            pass: config.get('mail_password'),
                        },
                    },
                    defaults: {
                        from: `no-reply<${config.get('mail_from')}>`,
                    },
                    template: {
                        dir,
                        adapter: new HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
