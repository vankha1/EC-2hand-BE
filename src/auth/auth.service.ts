import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users';
import { RegisterDto } from './dto/register.dto';
import { compareContent, hashedContent } from 'src/utils';
import { authMess, userMess } from 'src/contants';
import { Role } from '../schema/users.schema';
import { LoginDto } from './dto';
import { MailService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtServices: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(
    payload: any,
    expiresIn = this.configService.get('expired'),
  ) {
    const token = await this.jwtServices.signAsync(payload, { expiresIn });
    return token;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, fullname } = registerDto;
    const user = await this.userService.findUser('email', email);
    if (user) throw new BadRequestException(authMess.EMAIL_EXISTED);

    const hashedPassword = hashedContent(password);
    const username = email.split('@')[0];

    const payload = {
      username,
      fullname,
      email,
      password: hashedPassword,
    };
    // create user and send email wellcome
    await Promise.all([
      this.userService.createNewUser(payload),
      this.mailService.sendEmailWellcome({
        to: email,
        subject: 'Wellcome to my website',
      }),
    ])

    return {
      message: userMess.CREATED,
      status: HttpStatus.CREATED,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, isAdmin } = loginDto;
    const user = await this.userService.findUser('email', email, {
      select: ['id', 'role', 'password'],
    });
    if (!user) throw new BadRequestException(authMess.NOT_CORRECT);

    if (isAdmin) {
      const isAdminLogin = user.role === Role.ADMIN;
      if (!isAdminLogin) throw new ForbiddenException(userMess.FORBIDDEN);
    }

    const isMatch = compareContent(password, user.password);
    if (!isMatch) throw new BadRequestException(authMess.NOT_CORRECT);

    const payload = { sub: user._id, role: user.role };
    const access_token = await this.generateToken(payload);

    return {
      message: authMess.LOGIN,
      statusCode: HttpStatus.OK,
      access_token,
    };
  }
}
