import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { sendMailDto } from './dto/send.dto';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendEmailWellcome(sendMailDto: sendMailDto) {
        const { subject, to } = sendMailDto;
        const username = to.split('@')[0];
        return await this.mailerService.sendMail({
            to,
            subject,
            context: {
                username,
            },
            template: './welcome',
        });
    }
}
