import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class IdService {
  createdId() {
    return createId();
  }
}
