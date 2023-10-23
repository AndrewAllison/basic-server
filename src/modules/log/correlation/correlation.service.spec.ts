import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationService } from './correlation.service';

describe('CorrelationService', () => {
  let service: CorrelationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelationService],
    }).compile();

    service = await module.resolve<CorrelationService>(CorrelationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should set correlation id', () => {
    service.setCorrelationId('1234');

    const result = service.getCorrelationId();
    expect(result).toEqual('1234');
  });
});
