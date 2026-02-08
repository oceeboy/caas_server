import { IsString } from 'class-validator';

export class JoinAgentConversationDto {
  @IsString()
  conversationId: string;
  @IsString()
  agentId: string;
}
