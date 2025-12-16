import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import {
  agentActivityProviders,
  agentProviders,
  agentSessionProviders,
} from './providers';
import { UsersModule } from '../users/users.module';
import { AgentController } from './agent.controller';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  providers: [
    AgentService,
    ...agentProviders,
    ...agentSessionProviders,
    ...agentActivityProviders,
  ],
  controllers: [AgentController],
})
export class AgentModule {}
