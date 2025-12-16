import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({}),
  ],
  providers: [MessageService],
})
export class MessageModule {}
