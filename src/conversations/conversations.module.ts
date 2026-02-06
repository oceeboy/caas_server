import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { DatabaseModule } from '../database/database.module';
import { conversationProviders } from './providers';
import { ConversationsController } from './conversations.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    ConversationsService,
    ...conversationProviders,
  ],
  exports: [ConversationsService],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
