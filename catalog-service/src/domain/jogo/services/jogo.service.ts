import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Jogo } from '../entidades/jogo.entity';
import { CreateJogoDto } from '../dto/create-jogo.dto';
import { Preco } from '../objetos_de_valor/preco.vo';
import { Categoria } from '../objetos_de_valor/categoria.vo';
import { ClassificacaoIndicativa } from '../objetos_de_valor/classificacao-indicativa.vo';
import { RequisitosTecnicos } from '../objetos_de_valor/requisitos-tecnicos.vo';
import { JogoCacheService } from './jogo-cache.service';

@Injectable()
export class JogoService {
  private readonly logger = new Logger(JogoService.name);
  
  private jogos: Jogo[] = [
    new Jogo(
      'aaa00000-0000-0000-0000-000000000001', 
      'Pokémon Fire Red',
      'Capture e treine monstrinhos de bolso nesta clássica aventura na região de Kanto.',
      'Game Freak',
      1500,
      new Preco(149.90, 'BRL'),
      new Categoria('RPG de turnos', 'Aventura'),
      new ClassificacaoIndicativa('Livre'),
      new RequisitosTecnicos('Nintendo Switch | Nintendo Switch 2', 'Gráficos Integrados', '2GB')
    )
  ];

  constructor(private readonly cacheService: JogoCacheService) {}

  async findAll(): Promise<Jogo[]> {
    this.logger.log({ msg: 'Buscando lista de todos os jogos', action: 'findAll' });

    const tempoInicio = performance.now(); // Início da cronometragem
    const cacheKey = 'produto:lista:todas';
    
    const cachedList = await this.cacheService.get<Jogo[]>(cacheKey);
    if (cachedList) {
      const tempoFim = performance.now();
      this.cacheService.registrarMetricaTempo(true, tempoFim - tempoInicio);

      this.logger.log({ msg: 'Lista de jogos recuperada do cache (HIT)', action: 'findAll', cacheHit: true }); // Regista HIT
      return cachedList;
    }

    const dadosBanco = this.jogos;
    await this.cacheService.set(cacheKey, dadosBanco, 120);
    
    const tempoFim = performance.now();
    this.cacheService.registrarMetricaTempo(false, tempoFim - tempoInicio); // Regista MISS

    this.logger.log({ msg: 'Lista de jogos recuperada da base de dados (MISS)', action: 'findAll', cacheHit: false });
    return dadosBanco;
  }

  async findOne(id: string): Promise<Jogo> {
    this.logger.log({ msg: 'Buscando jogo por ID', action: 'findOne', jogoId: id });

    const tempoInicio = performance.now(); // Início da cronometragem
    const cacheKey = `produto:item:${id}`;

    const cachedJogo = await this.cacheService.get<Jogo>(cacheKey);
    if (cachedJogo) {
      const tempoFim = performance.now();
      this.cacheService.registrarMetricaTempo(true, tempoFim - tempoInicio); // Regista HIT
      this.logger.log({ msg: 'Jogo recuperado do cache (HIT)', action: 'findOne', cacheHit: true, jogoId: id });
      return cachedJogo;
    }

    const jogo = this.jogos.find(j => j.jogoId === id);
    if (!jogo) {
      this.logger.warn({ msg: 'Jogo não encontrado', action: 'findOne', jogoId: id });
      throw new NotFoundException(`Jogo com ID ${id} não encontrado`);
    }

    await this.cacheService.set(cacheKey, jogo, 300);
    
    const tempoFim = performance.now();
    this.cacheService.registrarMetricaTempo(false, tempoFim - tempoInicio); // Regista MISS
    this.logger.log({ msg: 'Jogo recuperado da base de dados (MISS)', action: 'findOne', cacheHit: false, jogoId: id });
    return jogo;
  }

  async create(dto: CreateJogoDto): Promise<Jogo> {
    
    this.logger.log({ msg: 'Iniciando criação de jogo', action: 'create', titulo: dto.titulo });

    const jogo = new Jogo(
      randomUUID(),
      dto.titulo,
      dto.descricao,
      dto.desenvolvedora,
      0,
      new Preco(dto.preco.valor, dto.preco.moeda),
      new Categoria(dto.categoria.nome, 'Categoria do jogo'),
      new ClassificacaoIndicativa(dto.classificacaoIndicativa.faixa),
      new RequisitosTecnicos(
        dto.requisitosTecnicos.sistemaOperacional,
        dto.requisitosTecnicos.placaDeVideo,
        dto.requisitosTecnicos.memoriaRam,
      ),
    );
    this.jogos.push(jogo);
    await this.cacheService.invalidate('produto:lista:todas');
    
    this.logger.log({ msg: 'Jogo criado com sucesso', action: 'create', jogoId: jogo.jogoId });
    return jogo;
  }

  async update(id: string, dto: CreateJogoDto): Promise<Jogo> {
    this.logger.log({ msg: 'Iniciando atualização de jogo', action: 'update', jogoId: id });
    
    const index = this.jogos.findIndex(j => j.jogoId === id);
    
    if (index === -1) {
      this.logger.warn({ msg: 'Falha ao atualizar: Jogo não encontrado', action: 'update', jogoId: id });
      throw new NotFoundException('Jogo não encontrado');
    }

    const jogoAtualizado = new Jogo(
      id,
      dto.titulo,
      dto.descricao,
      dto.desenvolvedora,
      this.jogos[index].numeroAnalises,
      new Preco(dto.preco.valor, dto.preco.moeda),
      new Categoria(dto.categoria.nome, 'Categoria do jogo'),
      new ClassificacaoIndicativa(dto.classificacaoIndicativa.faixa),
      new RequisitosTecnicos(
        dto.requisitosTecnicos.sistemaOperacional,
        dto.requisitosTecnicos.placaDeVideo,
        dto.requisitosTecnicos.memoriaRam,
      ),
    );

    this.jogos[index] = jogoAtualizado;
    await this.cacheService.invalidate(`produto:item:${id}`);
    await this.cacheService.invalidate('produto:lista:todas');
    
    this.logger.log({ msg: 'Jogo atualizado com sucesso', action: 'update', jogoId: id });
    return jogoAtualizado;
  }

  async delete(id: string) {
    this.logger.log({ msg: 'Iniciando exclusão de jogo', action: 'delete', jogoId: id });
    const index = this.jogos.findIndex(j => j.jogoId === id);
    
    if (index === -1) {
      this.logger.warn({ msg: 'Falha ao excluir: Jogo não encontrado', action: 'delete', jogoId: id });
      throw new NotFoundException('Jogo não encontrado');
    }
    this.jogos.splice(index, 1);
    await this.cacheService.invalidate(`produto:item:${id}`);
    await this.cacheService.invalidate('produto:lista:todas');
    
    this.logger.log({ msg: 'Jogo excluído com sucesso', action: 'delete', jogoId: id });
    return { message: 'Jogo removido com sucesso' };
  }

  // Método que faz a ponte para recolher os contadores estruturados
  async obterMétricasDoCache() {
    return this.cacheService.obterEstatisticas();
  }
}