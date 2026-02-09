import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import type { Request } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { JoinAgentConversationDto } from './dtos';

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
  async getAllConversations(
    @Req() request: Request,
  ) {
    const orgId = request.user?.orgId;
    if (!orgId) {
      throw new NotFoundException(
        'Organization not found',
      );
    }

    // Parse pagination and sorting from query params
    const page = request.query.page
      ? Number(request.query.page)
      : undefined;
    const limit = request.query.limit
      ? Number(request.query.limit)
      : undefined;
    const sortBy = request.query.sortBy as
      | string
      | undefined;
    const sortOrder = request.query.sortOrder as
      | 'asc'
      | 'desc'
      | undefined;

    this.logger.log(
      `Fetching conversations for orgId: ${orgId}, page: ${page}, limit: ${limit}, sortBy: ${sortBy}, sortOrder: ${sortOrder}`,
    );

    try {
      const conversations =
        await this.conversationsService.getConversations(
          {
            orgId,
            page,
            limit,
            sortBy,
            sortOrder,
          },
        );
      this.logger.debug(
        `Found ${conversations.length} conversations for orgId: ${orgId}`,
      );
      return conversations;
    } catch (error) {
      this.logger.error(
        `Error fetching conversations for orgId: ${orgId}`,
        error.stack,
      );
      throw error;
    }
  }
  // =======================================================================
  // Get conversation by ID with orgId check

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
      request.user?.orgId || 'unknown_org',
    );
  }

  @Post('join')
  @UseGuards(AuthGuard('jwt')) // Add appropriate guards if needed
  async agentJoinConversation(
    @Body()
    joinAgentConversationDto: JoinAgentConversationDto,
    @Req() request: Request,
  ) {
    // const { id, agentId } = request.params;
    const { agentId, conversationId } =
      joinAgentConversationDto;
    this.logger.log(
      `Agent ${agentId} joining conversation with ID: ${conversationId}`,
    );

    const orgId = request.user?.orgId;
    if (!orgId) {
      throw new NotFoundException(
        'Organization not found',
      );
    }

    return this.conversationsService.agentJoinConversation(
      conversationId,
      agentId,
      request.user?.orgId || 'unknown_org',
    );
  }
}
