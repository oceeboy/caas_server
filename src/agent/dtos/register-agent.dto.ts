import {
  IsEmail,
  IsString,
} from 'class-validator';

export class RegisterAgentDto {
  @IsString()
  agentName: string;

  @IsEmail()
  agentEmail: string;
}
