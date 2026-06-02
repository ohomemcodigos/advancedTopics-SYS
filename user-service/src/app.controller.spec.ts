/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './user.controller';
import { AppService } from './user.service';
import { describe, beforeEach, it, expect } from '@jest/globals';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    const controller = app.get(AppController);
    if (!controller) {
      throw new Error('AppController not found');
    }
    appController = controller as AppController;
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});
