import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => MessageModule),
  ],
  providers: [ChatGateway, ChatService],
})
export class GatewaysModule {}
