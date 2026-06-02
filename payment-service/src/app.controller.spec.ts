import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './payment.controller';
import { AppService } from './payment.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
});

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});