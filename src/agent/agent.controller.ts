import {
  Body,
  Controller,
  Get,
  Ip,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { RegisterAgentDto } from './dtos';

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
    const agentId = request.params.id;

    const orgId = request.user?.orgId;
    if (!orgId) {
      throw new NotFoundException(
        'Organization not found',
      );
    }

    const agent =
      await this.agentService.getAgentById(
        agentId,
        orgId?.toString() || '',
      );
    return agent;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAgents(@Req() request: Request) {
    const orgId = request.user?.orgId;
    if (!orgId) {
      return [];
    }
    const agents =
      await this.agentService.getAgentsByOrgId(
        orgId.toString(),
      );
    return agents;
  }

  @Post('delete/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteAgent(@Req() request: Request) {
    const agentId = request.params.id;

    const orgId = request.user?.orgId;
    if (!orgId) {
      throw new NotFoundException(
        'Organization not found',
      );
    }

    return await this.agentService
      .deleteChatAgentRecord
      // agentId,
      // orgId?.toString() || '',
      ();
  }

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  async registerAgent(
    @Body()
    registerAgentDto: RegisterAgentDto,
    @Ip() ipAddress: string,
    @Req() request: Request,
  ) {
    const userAgent =
      request.headers['user-agent'] || '';

    const orgId = request.user?.orgId;
    if (!orgId) {
      throw new NotFoundException(
        'Organization not found',
      );
    }
    const { agentEmail, agentName } =
      registerAgentDto;
    const userId = request.user?._id;

    return await this.agentService.registerAgent({
      userId: userId?.toString() || '',
      name: agentName,
      email: agentEmail,
    });
  }
}
