import { IsString } from 'class-validator';

export class VisitorConversationDto {
  @IsString()
  visitorId: string;
  @IsString()
  orgId: string;
}
