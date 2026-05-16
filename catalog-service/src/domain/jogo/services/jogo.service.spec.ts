import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { JogoService } from './jogo.service';
import { NotFoundException } from '@nestjs/common';

describe('JogoService (Unitário)', () => {
  let service: JogoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JogoService],
    }).compile();
    service = module.get<JogoService>(JogoService);
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

  it('deve retornar uma lista de jogos (findAll) [cite: 90, 94]', () => {
    expect(service.findAll()).toBeInstanceOf(Array);
  });

  it('deve cadastrar e encontrar um jogo [cite: 71, 94]', () => {
    const criado = service.create(mockDto);
    const encontrado = service.findOne(criado.jogoId);
    expect(encontrado).toBeDefined();
    expect(encontrado.titulo).toBe(mockDto.titulo);
  });

  it('deve lançar NotFoundException ao buscar ID inexistente ', () => {
    expect(() => service.findOne('id-fake')).toThrow(NotFoundException);
  });

  it('deve atualizar um jogo com sucesso ', () => {
    const criado = service.create(mockDto);
    const updateDto = { ...mockDto, titulo: 'Silksong' };

    const atualizado = service.update(criado.jogoId, updateDto);

    expect(atualizado.titulo).toBe('Silksong');
  });

  it('deve garantir que o jogo foi removido da lista [cite: 72, 896]', () => {
    const criado = service.create(mockDto);

    service.delete(criado.jogoId);

    expect(() => service.findOne(criado.jogoId)).toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException ao deletar inexistente [cite: 7, 96]', () => {
    expect(() => service.delete('fake-id')).toThrow(NotFoundException);
  });
});
