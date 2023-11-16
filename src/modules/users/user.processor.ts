import {
  OnGlobalQueueWaiting,
  OnQueueActive,
  OnQueueFailed,
  OnQueueStalled,
  OnQueueWaiting,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { UsersQueueKeys } from './models/constants';
import { LogService } from '../log/log.service';

@Processor({
  name: UsersQueueKeys.queue,
})
export class UserProcessor {
  constructor(private readonly logger: LogService) {}
  @Process({ name: UsersQueueKeys.removeData })
  handleTranscode(job: Job) {
    // if (parseInt(`${job.id}`) % 2 === 1) throw new Error();
    this.logger.info({}, `[Processing] (${job.id})`);
    console.log('Start transcoding...');
    console.log(job.data);
    console.log('Transcoding completed');
  }
  @OnQueueFailed()
  handleRemoveFailures() {
    console.log('Failed');
  }
  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueWaiting()
  onWaiting(jobId: string | number) {
    console.log('Waiting', jobId);
  }

  @OnGlobalQueueWaiting()
  onGlobalQueueWaiting(jobId: string | number) {
    console.log('Global Waiting', jobId);
  }

  @OnQueueStalled()
  onQueueStalled(job: Job) {
    console.log('Global Waiting', job);
  }
}
