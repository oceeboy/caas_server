import { IsString } from 'class-validator';

export class StartAgentSession {
  @IsString()
  agentId: string;

  @IsString()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsString()
  orgId: string;
}
