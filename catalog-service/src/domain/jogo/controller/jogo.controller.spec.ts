import { describe, beforeEach, it, expect, afterAll, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JogoController } from './jogo.controller';
import { JogoService } from '../services/jogo.service';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';

describe('JogoController (Integração)', () => {
  let app: INestApplication;
  
  const mockJogoService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    // Arrange
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [JogoController],
      providers: [{ provide: JogoService, useValue: mockJogoService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  describe('Cenários de Erro e Validação', () => {
    it('deve retornar 400 se o preço for negativo (Validação DTO) [cite: 471]', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/jogos')
        .send({
          titulo: 'Jogo Inválido',
          preco: { valor: -10, moeda: 'BRL' } // preço > 0
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('deve retornar 404 se o jogo não existir (Integração Service) [cite: 473, 482]', async () => {
      // Arrange
      mockJogoService.findOne.mockImplementation(() => {
        throw new NotFoundException('Jogo não encontrado');
      });

      // Act
      const response = await request(app.getHttpServer()).get('/jogos/id-fake');

      // Assert
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});