import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { LogService } from './modules/log/log.service';
import { mockDeep } from 'jest-mock-extended';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: LogService,
          useValue: mockDeep<LogService>(),
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('AppController', () => {
    it('should return basic health check details', () => {
      const results = appController.getInfo('192.168.0.1');
      expect(results.ip).toBe('192.168.0.1');
      expect(results.env).toBe('test');
    });
  });
});
