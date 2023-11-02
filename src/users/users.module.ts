import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../modules/db/prisma/prisma.module';
import { UserProcessor } from './user.processor';
import { LogModule } from '../modules/log/log.module';
import { QueueModule } from '../modules/queue/queue.module';

@Module({
  imports: [PrismaModule, LogModule, QueueModule],
  providers: [UserService, UserProcessor],
  exports: [UserService],
  controllers: [UsersController],
})
export class UsersModule {}
