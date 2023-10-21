import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
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
