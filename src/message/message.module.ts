import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { messageProvider } from './providers';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
  ],
  providers: [MessageService, ...messageProvider],
  exports: [MessageService],
})
export class MessageModule {}
