import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JogoCacheService } from '../src/domain/jogo/services/jogo-cache.service';

describe('Jogos (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // Isola o Redis para permitir que as rotas HTTP de criação sejam testadas localmente
    .overrideProvider(JogoCacheService)
    .useValue({
      get: async () => null,
      set: async () => {},
      invalidate: async () => {},
      registrarMetricaTempo: () => {},
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/jogos (POST) - Deve criar um jogo com sucesso', () => {
    return request(app.getHttpServer())
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
      .expect(201)
      .then((response) => {
        expect(response.body.jogoId).toBeDefined();
        expect(response.body.titulo).toBe('God of War');
      });
  });

  it('/jogos (GET) - Deve retornar a lista de jogos', () => {
    return request(app.getHttpServer()).get('/jogos').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
