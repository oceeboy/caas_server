import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

//
@Injectable()
export class WidgetStrategy extends PassportStrategy(
  Strategy,
  'jwt-widget',
) {
  constructor(config: ConfigService) {
    const jwtSecret = config.get<string>(
      'VISITOR_JWT_SECRET',
    );
    if (!jwtSecret) {
      throw new Error(
        'VISITOR_JWT_SECRET is not defined in configuration',
      );
    }
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }
  async validate(payload: any) {
    return payload;
  }
}
