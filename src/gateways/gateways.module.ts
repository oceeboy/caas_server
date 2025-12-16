import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [ChatGateway, ChatService],
})
export class GatewaysModule {}
