import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterOrgDto,
  RegisterAgentDto,
} from './dtos';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    // return this.authService.getProfile();
    return req.user;
  }
  @HttpCode(HttpStatus.CREATED)
  @Post('register-org')
  registerOrganization(
    @Body() registerOrgDto: RegisterOrgDto,
  ) {
    return this.authService.registerOrganization(
      registerOrgDto,
    );
  }
  // register agent endpoint
  @HttpCode(HttpStatus.CREATED)
  @Post('register-agent')
  registerAgent(
    @Body() registerAgentDto: RegisterAgentDto,
  ) {
    return this.authService.registerAgent(
      registerAgentDto,
    );
  }
  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  refreshToken(@Req() req: any) {
    const user = req.user;
    return this.authService.refreshToken(
      user._id,
      user.email,
      user.role,
    );
  }
  @Get('session-info')
  @UseGuards(AuthGuard('jwt'))
  sessionInfo() {
    return this.authService.sessionInfo();
  }
}
