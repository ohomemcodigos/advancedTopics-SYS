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
    descricao: 'Aventura 2D',
    desenvolvedora: 'Team Cherry',
    preco: { valor: 120, moeda: 'BRL' },
    categoria: { nome: 'Metroidvania' },
    classificacaoIndicativa: { faixa: 'Livre' },
    requisitosTecnicos: { sistemaOperacional: 'Win', placaDeVideo: 'GTX', memoriaRam: '8GB' }
  };

  it('deve retornar uma lista de jogos (findAll)', () => {
    expect(service.findAll()).toBeInstanceOf(Array);
  });

  it('deve cadastrar e encontrar um jogo (create e findOne)', () => {
    const criado = service.create(mockDto);
    const encontrado = service.findOne(criado.jogoId);

    expect(encontrado).toBeDefined();
    expect(encontrado?.titulo).toBe(mockDto.titulo);
  });

  it('deve atualizar um jogo com sucesso (update)', () => {
    const criado = service.create(mockDto);
    const updateDto = { ...mockDto, titulo: 'Hollow Knight Silksong' };
    
    const atualizado = service.update(criado.jogoId, updateDto);
    expect(atualizado.titulo).toBe('Hollow Knight Silksong');
  });

  it('deve remover um jogo (delete)', () => {
    const criado = service.create(mockDto);
    service.delete(criado.jogoId);

    expect(() => service.findOne(criado.jogoId)).toThrow(NotFoundException);
  });
});