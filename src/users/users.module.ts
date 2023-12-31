import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../modules/db/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UsersController],
})
export class UsersModule {}
