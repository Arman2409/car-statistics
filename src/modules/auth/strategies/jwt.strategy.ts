import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';
import type { ValidateArgs } from '@/modules/auth/types/ValidateArgs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: ValidateArgs) {
    const user = await this.usersService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const response = {
      username: user.username,
      sub: user.id,
    };

    return response;
  }
}
