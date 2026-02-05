import {
  Injectable,
  Logger,
} from '@nestjs/common';
import type { VisitorConversationDto } from './dtos';

@Injectable()
export class ConversationsService {
  constructor() {}
  private readonly logger = new Logger(
    ConversationsService.name,
  );

  async startConversation(
    dto: VisitorConversationDto,
  ) {
    // first visitor session, create a new conversation
    this.logger.log(
      'Starting a new conversation...',
      dto,
    );

    return {
      conversationId: `conversation_${Date.now()}`,
    };
  }
}
