import { describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { JogoCacheService } from './../src/domain/jogo/services/jogo-cache.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // 👇 BLINDA O TESTE: Substitui o cache real por uma versão falsa (Mock) para não travar a conexão
    .overrideProvider(JogoCacheService)
    .useValue({
      get: async () => null,
      set: async () => {},
      invalidate: async () => {},
      registrarMetricaTempo: () => {},
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});