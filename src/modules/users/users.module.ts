import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../db/prisma/prisma.module';
import { UserProcessor } from './user.processor';
import { LogModule } from '../log/log.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, LogModule, QueueModule],
  providers: [UserService, UserProcessor],
  exports: [UserService],
  controllers: [UsersController],
})
export class UsersModule {}
