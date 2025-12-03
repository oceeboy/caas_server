import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import {
  organizationProviders,
  usersProviders,
} from './providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    UsersService,
    ...usersProviders,
    ...organizationProviders,
  ],
  exports: [UsersService],
})
export class UsersModule {}
