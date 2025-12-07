import {
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { WidgetAuthDto } from './dtos';
import type { Request } from 'express';

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
}
