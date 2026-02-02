import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('agent')
export class AgentController {
  constructor(
    private agentService: AgentService,
  ) {}

  // Define your routes and handlers here

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createAgent(
    @Body()
    dto: {
      name?: string;
      email?: string;
    },
    @Ip() ipAddress: string,
    @Req() request: Request,
  ) {
    const userAgent =
      request.headers['user-agent'] || '';

    const user = (request as any).user;

    return await this.agentService.createChatAgentRecord(
      {
        userId: user._id,
        name: dto.name,
        email: dto.email,
      },
      ipAddress,
      userAgent,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getAgentById(@Req() request: Request) {
    const user = (request as any).user;
    const agentId = user.agentId; // assuming the JWT contains agentId

    return await this.agentService.getAgentById(
      agentId,
    );
  }
}
