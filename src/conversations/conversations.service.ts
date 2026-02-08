import {
  Inject,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { VisitorConversationDto } from './dtos';
import { ConversationDocument } from './schemas';
import mongoose, { Model } from 'mongoose';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject('CONVERSATION_MODEL')
    private readonly conversationModel: Model<ConversationDocument>,
    private readonly agentService: AgentService, // Inject AgentService to manage agent interactions within conversations
  ) {}
  private readonly logger = new Logger(
    ConversationsService.name,
  );

  private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

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

  /**
   * @title - Get Conversations in ConversationsService
   * @description - Retrieves conversations filtered by orgId, supports pagination and sorting for scalability.
   * @param data - Contains orgId, optional pagination and sorting parameters
   * @returns Array of conversation summaries
   */
  async getConversations(data: {
    orgId: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      orgId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = data;

    const skip = (page - 1) * limit;

    const conversations =
      await this.conversationModel
        .find({ orgId })
        .sort({
          [sortBy]: sortOrder === 'asc' ? 1 : -1,
        })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

    if (
      !conversations ||
      conversations.length === 0
    ) {
      this.logger.warn(
        `No conversations found for orgId: ${orgId}`,
      );
      return [];
    }

    return conversations.map((conversation) => ({
      conversationId: conversation._id.toString(),
      status: conversation.status,
      visitorId: conversation.visitorId,
      agentId: conversation.agentId
        ? conversation.agentId.toString()
        : null,
      orgId: conversation.orgId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }));

    return conversations;
  }

  async getConversationById(
    conversationId: string,
    orgId: string,
  ) {
    if (!this.isValidObjectId(conversationId)) {
      throw new NotAcceptableException(
        'Invalid conversation ID',
      );
    }
    const conversation =
      await this.conversationModel
        .findById(conversationId)
        .where('orgId')
        .equals(orgId)
        .lean()
        .exec();
    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }
    return {
      conversationId: conversation._id.toString(),
      status: conversation.status,
      visitorId: conversation.visitorId,
      agentId: conversation.agentId
        ? conversation.agentId.toString()
        : null,
      orgId: conversation.orgId,
    };
  }

  // this is for the agent to join the conversation, we will set the status to open if it is not already open, and assign the primary agent to the conversation. We can extend this in the future to support multiple agents if needed.
  // -- for now this does an idempotent update, if the agent is already assigned to the conversation, it will not update the conversation again, but it will return a success message.
  async agentJoinConversation(
    conversationId: string,
    agentId: string,
    orgId: string,
  ) {
    if (!this.isValidObjectId(orgId)) {
      throw new NotAcceptableException(
        'Invalid organization ID',
      );
    }
    // check if the conversation exists and belongs to the organization
    const conversation =
      await this.getConversationById(
        conversationId,
        orgId,
      );

    if (
      conversation.agentId &&
      conversation.agentId.toString() === agentId
    ) {
      // Agent is already assigned to the conversation, return success message
      return {
        message: `Agent ${agentId} is already assigned to conversation ${conversationId}`,
      };
    }

    // check if the agent exists and belongs to the organization
    const agent =
      await this.agentService.getAgentById(
        agentId,
        orgId,
      );

    // logic to add the agent to the conversation (e.g., update conversation record, notify participants, etc.) also make status to open if it is not already open

    const updatedConversation =
      await this.conversationModel
        .findByIdAndUpdate(
          { _id: conversation.conversationId },
          {
            // $addToSet: { agentId: agent._id }, // TODO:  Assuming conversation schema has an array field 'agentIds' to track agents in the conversation will be implemented in the future if we want to support multiple agents in a conversation, for now we will just track the primary agent in the 'agentId' field and update it if a new agent joins. We can extend this in the future to support multiple agents if needed.
            $set: {
              status: 'open',
              agentId: agent._id,
            }, // Set status to open if not already open & assign the primary agent to the conversation
          },
          { new: true },
        )
        .exec();

    if (!updatedConversation) {
      throw new NotFoundException(
        'Failed to update conversation with agent',
      );
    }

    // TODO: Implement notification logic to inform the visitor and other agents in the conversation about the new agent joining (e.g., via WebSocket events)
    //-- using email or in-app notifications
    // if user is online, send in-app notification, if user is offline, send email notification
    return {
      message: `Agent ${agent.agentName} joined conversation ${conversationId} successfully`,
    };
  }
}
