import { describe, beforeEach, afterAll, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { JogoCacheService } from './../src/domain/jogo/services/jogo-cache.service';

describe('JogosController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(JogoCacheService)
    .useValue({
      get: () => Promise.resolve(null),
      set: async () => {},
      invalidate: async () => {},
      registrarMetricaTempo: () => {},
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/jogos (POST) - Deve criar um jogo com sucesso', async () => {
    const response = await request(app.getHttpServer())
      .post('/jogos')
      .send({
        titulo: 'God of War',
        descricao: 'Aventura épica de Kratos',
        desenvolvedora: 'Santa Monica',
        preco: { valor: 200, moeda: 'BRL' },
        categoria: { nome: 'Ação' },
        classificacaoIndicativa: { faixa: '18+' },
        requisitosTecnicos: {
          sistemaOperacional: 'PS5',
          placaDeVideo: 'N/A',
          memoriaRam: '16GB',
        },
      })
      .expect(201);

    expect(response.body?.jogoId).toBeDefined();
    expect(response.body?.titulo).toBe('God of War');
  });

  afterAll(async () => {
    await app.close();
  });
});