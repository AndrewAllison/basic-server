import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UsersQueueKeys } from './models/constants';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

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

export class RemoveUserDataEvent {
  constructor({ userId }: { userId: string }) {
    this.userId = userId;
  }
  @IsNotEmpty()
  userId: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue(UsersQueueKeys.queue) private readonly queue: Queue,
  ) {}

  @OnEvent(UsersQueueKeys.removeData)
  async handleOrderCreatedEvent(payload: RemoveUserDataEvent) {
    console.log('[EVENT-EMITTING]', payload);
    // handle and process "OrderCreatedEvent" event
    await this.queue.add(UsersQueueKeys.removeData, {
      userId: payload.userId,
    });
  }

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
      this.eventEmitter.emit(
        UsersQueueKeys.removeData,
        new RemoveUserDataEvent({
          userId,
        }),
      );
      return [userId];
    } catch (e) {
      console.error(e);
      return { error: e };
    }
  }
}
