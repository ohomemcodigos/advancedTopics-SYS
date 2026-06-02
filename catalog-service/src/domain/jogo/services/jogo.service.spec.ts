import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JogoService } from './jogo.service';
import { JogoCacheService } from './jogo-cache.service';
import { NotFoundException } from '@nestjs/common';

// Mock completo do JogoCacheService para isolar o JogoService
const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),        // sempre MISS para simplificar
  set: jest.fn().mockResolvedValue(undefined),
  invalidate: jest.fn().mockResolvedValue(undefined),
  registrarMetricaTempo: jest.fn(),
  obterEstatisticas: jest.fn().mockReturnValue({}),
};

describe('JogoService (Unitário)', () => {
  let service: JogoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JogoService,
        { provide: JogoCacheService, useValue: mockCacheService },
      ],
    }).compile();
    service = module.get<JogoService>(JogoService);
    jest.clearAllMocks();
  });

  const mockDto: any = {
    titulo: 'Hollow Knight',
    descricao: 'Aventura épica',
    desenvolvedora: 'Team Cherry',
    preco: { valor: 120, moeda: 'BRL' },
    categoria: { nome: 'Metroidvania' },
    classificacaoIndicativa: { faixa: 'Livre' },
    requisitosTecnicos: {
      sistemaOperacional: 'Win',
      placaDeVideo: 'GTX',
      memoriaRam: '8GB',
    },
  };

  it('deve retornar uma lista de jogos (findAll)', async () => {
    const result = await service.findAll();
    expect(result).toBeInstanceOf(Array);
  });

  it('deve cadastrar e encontrar um jogo', async () => {
    const criado = await service.create(mockDto);
    const encontrado = await service.findOne(criado.jogoId);
    expect(encontrado).toBeDefined();
    expect(encontrado.titulo).toBe(mockDto.titulo);
  });

  it('deve lançar NotFoundException ao buscar ID inexistente', async () => {
    await expect(service.findOne('id-fake')).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um jogo com sucesso', async () => {
    const criado = await service.create(mockDto);
    const updateDto = { ...mockDto, titulo: 'Silksong' };
    const atualizado = await service.update(criado.jogoId, updateDto);
    expect(atualizado.titulo).toBe('Silksong');
  });

  it('deve garantir que o jogo foi removido da lista', async () => {
    const criado = await service.create(mockDto);
    await service.delete(criado.jogoId);
    await expect(service.findOne(criado.jogoId)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException ao deletar ID inexistente', async () => {
    await expect(service.delete('fake-id')).rejects.toThrow(NotFoundException);
  });
});
