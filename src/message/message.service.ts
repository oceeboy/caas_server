import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { MessageDocument } from './schemas';

@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGE_MODEL')
    private messageModel: Model<MessageDocument>,
  ) {}

  //=========================================================//
  // Create a new message
  //========================================================//
  private async createMessage(dto: {
    content: string;
    senderId: string;
    senderType: 'agent' | 'visitor';
  }): Promise<MessageDocument> {
    const newMessage = new this.messageModel(dto);
    return newMessage.save();
  }

  // create a vistor message record
  async createVisitorMessageRecord(dto: {
    content: string;
    senderId: string;
  }): Promise<MessageDocument> {
    return await this.createMessage({
      content: dto.content,
      senderId: dto.senderId,
      senderType: 'visitor',
    });
  }

  // create an agent message record

  async createAgentMessageRecord(dto: {
    content: string;
    senderId: string;
  }): Promise<MessageDocument> {
    return await this.createMessage({
      content: dto.content,
      senderId: dto.senderId,
      senderType: 'agent',
    });
  }
}
