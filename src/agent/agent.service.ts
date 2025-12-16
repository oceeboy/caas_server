import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import {
  AgentActivityDocument,
  AgentDocument,
  AgentSessionDocument,
} from './schemas';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentService {
  constructor(
    @Inject('AGENT_MODEL')
    private agentModel: Model<AgentDocument>,
    @Inject('AGENT_SESSION_MODEL')
    private agentSessionModel: Model<AgentSessionDocument>,
    @Inject('AGENT_ACTIVITY_MODEL')
    private agentActivityModel: Model<AgentActivityDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   *  in here is the business logic for agent management
   *  such as creating, updating, and deleting agents.
   *  Also managing agent sessions and activities.
   */

  // ==============================================================
  // Agent Management (first use a user identity to create an agent record either admin or agent role)
  //  * any business that wants to chat with vistor must identify as an agent
  //  * so they need to have there on jwt token
  // ==============================================================

  async createChatAgentRecord(
    dto: {
      userId: string;
      name?: string;
      email?: string;
    },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ token: string; message: string }> {
    const { userId, name, email } = dto;

    const user =
      await this.usersService.getProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // find or create agent record
    let agent = await this.agentModel.findOne({
      handleBy: user._id,
    });
    if (!agent) {
      agent = new this.agentModel({
        agentName: name || user.name,
        agentEmail: email || user.email,
        handleBy: user._id,
        orgId: user.orgId,
        role: 'agent',
      });
      await agent.save();
    }
    // create session for agent
    const agentSession =
      new this.agentSessionModel({
        agentId: agent._id,
        orgId: agent.orgId,
        ipAddress: ipAddress || '',
        userAgent: userAgent || '',
      });
    await agentSession.save();
    const payload = {
      sub: String(agent._id),
      orgId: String(agent.orgId),
      sessionId: String(agentSession._id),
      role: 'agent',
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'VISITOR_JWT_SECRET', // using visitor jwt secret for agent for now since both have similar privileges
      ),
      expiresIn: '1h',
    });

    return {
      token: token,
      message:
        'Agent record created successfully',
    };
  }

  async updateChatAgentRecord() {
    // Implementation for updating a chat agent record
  }

  async deleteChatAgentRecord() {
    // Implementation for deleting a chat agent record
  }

  // ==============================================================
  // Agent Session Management
  // ==============================================================
  async startAgentSession() {
    // Implementation for starting an agent session
  }
}
