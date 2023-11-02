import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { BullModule } from '@nestjs/bull';
import { UsersQueueKeys } from '../../users/constants';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

export const userQueues = [
  BullModule.registerQueue({
    name: UsersQueueKeys.queue,
  }),
  BullBoardModule.forFeature({
    name: UsersQueueKeys.queue,
    adapter: BullMQAdapter,
  }),
];

@Module({
  imports: [...userQueues],
  exports: [...userQueues],
  controllers: [QueueController],
})
export class QueueModule {}
