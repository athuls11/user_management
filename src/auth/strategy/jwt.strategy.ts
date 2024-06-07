import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import e from 'express';
// import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(req: e.Request, payload: any) {
    const rawToken = req.headers['authorization'].split(' ')[1];
    let key = process.env.JWT_SECRET;
    let users = this.jwtService.verify(rawToken, { secret: key });
    if (!users)
      throw new HttpException(
        {
          success: false,
          message: 'Invalid Token',
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    return users;
  }
}
