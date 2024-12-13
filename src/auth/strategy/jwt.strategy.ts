import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UsersService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('secret'),
    })
  }

  async validate(payload: any) {
    if (!payload) throw new UnauthorizedException('Invalid token')
    const user = await this.userService.findUser('id', payload.sub, {
      select: ['role'],
    })
    if (!user._id) throw new UnauthorizedException('Login to countinue action')
    return user
  }
}
