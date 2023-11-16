import { Test, TestingModule } from '@nestjs/testing';
import { IdService } from './id.service';

describe('IdService', () => {
  let service: IdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdService],
    }).compile();

    service = module.get<IdService>(IdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createId', () => {
    it('should return a random id', () => {
      const id = service.createdId();
      expect(id).not.toBeNull();
    });
  });
});
