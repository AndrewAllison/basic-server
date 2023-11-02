import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../modules/db/prisma/prisma.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UsersQueueKeys } from './constants';

export class RegisterUser {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  name: string;
}

export class RemoveUserDataParams {
  @IsNotEmpty()
  userId: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(UsersQueueKeys.queue) private readonly queue: Queue,
  ) {}
  @Get('')
  async getUsers() {
    return this.prisma.user.findMany();
  }

  @Post('register')
  async registerUser(@Body() registerUser: RegisterUser) {
    return registerUser;
  }

  @Post('remove-data/:userId')
  async removeData(@Param() removeUserParams: RemoveUserDataParams) {
    try {
      const { userId } = removeUserParams;
      await this.queue.add(UsersQueueKeys.removeData, {
        userId,
      });
      return [userId];
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }
}
