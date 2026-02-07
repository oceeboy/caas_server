import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { DatabaseModule } from '../database/database.module';
import { conversationProviders } from './providers';
import { ConversationsController } from './conversations.controller';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AgentModule),
  ], // Import AgentModule to use AgentService in ConversationsService
  providers: [
    ConversationsService,
    ...conversationProviders,
  ],
  exports: [ConversationsService],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
