import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { VisitorConversationDto } from './dtos';
import { ConversationDocument } from './schemas';
import { Model } from 'mongoose';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject('CONVERSATION_MODEL')
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}
  private readonly logger = new Logger(
    ConversationsService.name,
  );

  /**
   * @title - Start Conversation in ConversationsService
   * @description - This method handles the logic for starting a new conversation when a visitor initiates contact through the widget.
   * - It creates a new conversation record in the database and returns the conversation ID for further interactions.
   * @param dto - DTO containing visitor and organization information to start a conversation
   * @returns and object containing the new conversation ID
   * @author - oceeboi
   */
  async startConversation(
    dto: VisitorConversationDto,
  ) {
    // first visitor session, create a new conversation
    this.logger.log(
      'Starting a new conversation...',
      dto,
    );

    // create conversation logic here

    const conversation =
      await this.conversationModel.create({
        visitorId: dto.visitorId,
        orgId: dto.orgId,
      });

    this.logger.log(
      'Conversation created successfully',
      {
        conversationId:
          conversation._id.toString(),
        status: conversation.status,
        visitorId: conversation.visitorId,
        orgId: conversation.orgId,
      },
    );

    return {
      conversationId: conversation._id.toString(),
    };
  }

  async getConversations() {
    // this conversation need to be paginated and filtered by orgId in real implementation
    const conversations =
      await this.conversationModel
        .find()
        .lean()
        .exec();

    return conversations.map((conversation) => ({
      conversationId: conversation._id.toString(),
      status: conversation.status,
      visitorId: conversation.visitorId,
      orgId: conversation.orgId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }));
  }

  async getConversationById(
    conversationId: string,
  ) {
    const conversation =
      await this.conversationModel.findById(
        conversationId,
      );
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return {
      conversationId: conversation._id.toString(),
      status: conversation.status,
      visitorId: conversation.visitorId,
      orgId: conversation.orgId,
    };
  }

  async agentJoinConversation(
    conversationId: string,
    agentId: string,
  ) {
    return {};
  }
}
