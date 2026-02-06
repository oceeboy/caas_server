import {
  Controller,
  Get,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  private readonly logger = new Logger(
    ConversationsController.name,
  );

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllConversations() {
    return this.conversationsService.getConversations();
  }
  @Get(':id')
  @UseGuards(AuthGuard('jwt')) // Add appropriate guards if needed
  async getConversationById(
    @Req() request: Request,
  ) {
    const { id } = request.params;
    this.logger.log(
      `Fetching conversation with ID: ${id}`,
    );
    return this.conversationsService.getConversationById(
      id,
    );
  }
}
