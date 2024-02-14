import { Controller, Get, Version } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UsersQueueKeys } from '../users/models/constants';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export class QueueStatus {
  name: string;
  total: number;
  completed: number;
  failed: number;
}

@Controller({
  path: 'queue',
  version: '1',
})
export class QueueController {
  private userQueue: Queue;

  constructor(@InjectQueue(UsersQueueKeys.queue) usersQueue: Queue) {
    this.userQueue = usersQueue;
  }

  @Version('1.1')
  @Get('status')
  @ApiResponse({
    status: 200,
    description:
      'Returns details of the current Queue statuses. The name and counts for total, completed and failed counts',
  })
  async getQueueStatus(): Promise<QueueStatus[]> {
    return [
      {
        name: 'users',
        total: await this.userQueue.count(),
        completed: await this.userQueue.getCompletedCount(),
        failed: await this.userQueue.getFailedCount(),
      },
    ];
  }

  @Get('failed')
  @ApiResponse({
    status: 200,
    description: 'Returns a list of the failed items in the queue',
  })
  async getQueueStatusFailed() {
    return await this.userQueue.getFailed();
  }

  @Get('retry-failed')
  @ApiResponse({
    status: 200,
    description: 'Will batch retry all of the failed jobs',
  })
  async retryFailed() {
    const failedCount = await this.userQueue.getFailedCount();
    console.log(`Failed ${failedCount}`);

    let startingPoint = 0;
    const maxJobs = 2;
    const batchSize = Math.ceil(failedCount / maxJobs);

    for (let i = 0; i < batchSize; i++) {
      console.log(`Batch ${i} of ${batchSize}`);
      console.log(
        `retreive ${startingPoint} to ${
          startingPoint + maxJobs
        } of ${failedCount}`,
      );

      const failedItems = await this.userQueue.getFailed(
        startingPoint,
        startingPoint + maxJobs,
      );

      for (const failedItem of failedItems) {
        console.log(`Retrying ${failedItem.id}`);
        await this.userQueue.add(UsersQueueKeys.removeData, {
          ...failedItem.data,
        });
      }

      startingPoint = startingPoint + maxJobs;
    }
  }
}
