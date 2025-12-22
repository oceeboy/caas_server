import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  RegisterOrgDto,
  RegisterAgentDto,
} from './dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
/**
 * Authentication service to handle login, registration, and token management.
 * Provides methods for user login, organization and agent registration,
 * and token refreshing using JWT.
 *
 * todo:  for version 2.0
 * - Rate limiting for refresh token requests.
 * - Logging and monitoring for authentication events. ## already in use but improve logging later
 * - Support for additional authentication methods (e.g., OAuth).
 * - User activity tracking and analytics.
 */
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
    const refreshSecret = this.config.get(
      'JWT_REFRESH_SECRET',
    );
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
        secret: refreshSecret,
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  private async invalidateJwtTokens(
    token: string,
  ) {
    // Logic to invalidate the token (e.g., add to a blacklist)
    this.logger.log(
      `Invalidating token: ${token}`,
    );
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
        String(user._id),
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

  async registerAgent(dto: RegisterAgentDto) {
    const user =
      await this.usersService.registerAgent(dto);

    // const { access_token, refresh_token } =
    //   await this.signToken(
    //     String(user._id),
    //     user.email,
    //     user.role,
    //   );

    return {
      message: 'Agent registered successfully',
      user,
      // access_token,
      // refresh_token,
    };
  }

  // refresh token logic to generate new access token
  async refreshToken(
    userId: string,
    token: string,
    email: string,
    role?: string,
  ) {
    // rate limit refresh token requests per user if needed
    const now = Date.now();
    this.logger.log(
      `Refreshing token for user ${userId} at ${new Date(
        now,
      ).toISOString()}`,
    );
    await this.invalidateJwtTokens(token);

    const { access_token } = await this.signToken(
      userId,
      email,
      role,
    );
    return { access_token };
  }

  async sessionInfo() {
    return {
      success: true,
      message: 'Session is valid',
      timestamp: new Date().toISOString(),
    };
  }
}
