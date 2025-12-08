import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { WidgetAuthDto } from './dtos';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('widget')
export class WidgetController {
  constructor(
    private readonly widgetService: WidgetService,
  ) {}

  @Post('authenticate')
  async authenticate(
    @Body() dto: WidgetAuthDto,
    @Req() req: Request,
  ) {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress;

    const userAgent =
      (req.headers['user-agent'] as string) || '';
    return this.widgetService.authenticateVisitor(
      dto,
      String(ip),
      userAgent,
    );
  }
  @Get('status')
  @UseGuards(AuthGuard('jwt-widget'))
  async getStatus(@Req() req: Request) {
    const user = req.user;
    // console.log('user', user);
    // return this.widgetService.getStatus();

    return {
      user: user,
    };
  }
}
