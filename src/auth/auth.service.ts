import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterOrgDto } from './dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private readonly logger = new Logger(
    AuthService.name,
  );
  // login logic

  async signToken(
    userId: string,
    email: string,
    role?: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const secret = this.config.get('JWT_SECRET');
    // accessToken
    const accessToken = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );

    // refreshToken

    const refreshToken = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '7d',
        secret: secret,
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user =
      await this.usersService.validateLogin(dto);
    const ok = Boolean(user);
    if (!ok)
      throw new UnauthorizedException(
        'Invalid credentials',
      );

    const { access_token, refresh_token } =
      await this.signToken(
        String(user.userId),
        dto.email,
        user.role,
      );

    return { user, access_token, refresh_token };
  }

  async registerOrganization(
    dto: RegisterOrgDto,
  ) {
    const user =
      await this.usersService.registerOrganization(
        dto,
      );

    const { access_token, refresh_token } =
      await this.signToken(
        String(user._id),
        user.email,
        user.role,
      );

    return {
      message:
        'Organization and admin user registered successfully',
      user,
      access_token,
      refresh_token,
    };
  }
}
