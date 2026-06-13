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
      'bg3-0000-0000-0000-000000000001',
      'Baldur\'s Gate 3',
      'Reúna seu grupo e retorne a Forgotten Realms em uma história de amizade, traição, sacrifício e sobrevivência.',
      'Larian Studios',
      500000,
      new Preco(199.99, 'BRL'),
      new Categoria('RPG', 'Estratégia'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 970 / RX 480', '8GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg'
    ),
    new Jogo(
      'cp77-0000-0000-0000-000000000002',
      'Cyberpunk 2077',
      'Um RPG de ação e aventura em mundo aberto ambientado na megalópole de Night City.',
      'CD Projekt Red',
      600000,
      new Preco(199.90, 'BRL'),
      new Categoria('FPS', 'RPG de Ação'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 1060 / RX 590', '16GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg'
    ),
    new Jogo(
      'mhw-0000-0000-0000-000000000003',
      'Monster Hunter: World',
      'Enfrente monstros gigantescos em cenários épicos e use o ecossistema a seu favor.',
      'Capcom',
      300000,
      new Preco(99.90, 'BRL'),
      new Categoria('RPG de Ação', 'Multiplayer'),
      new ClassificacaoIndicativa('12+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 760 / R7 260x', '8GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/library_600x900.jpg'
    ),
    new Jogo(
      'vtm-0000-0000-0000-000000000004',
      'Vampire: The Masquerade - Bloodlines',
      'Mergulhe no submundo sombrio de Los Angeles como uma criatura da noite em um RPG denso e atmosférico.',
      'Troika Games',
      25000,
      new Preco(49.99, 'BRL'),
      new Categoria('RPG', 'Imersivo'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10', 'Placa 3D 100% compatível com DirectX 9', '4GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2600/library_600x900.jpg'
    ),
    new Jogo(
      'tw3-0000-0000-0000-000000000005',
      'The Witcher 3: Wild Hunt',
      'Você é Geralt de Rívia, um caçador de monstros mercenário. O continente devastado pela guerra está aberto para exploração.',
      'CD Projekt Red',
      700000,
      new Preco(139.90, 'BRL'),
      new Categoria('RPG', 'Aventura'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 770 / R9 290', '8GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg'
    ),
    new Jogo(
      'eld-0000-0000-0000-000000000006',
      'Elden Ring',
      'Levante-se, Maculado, e seja guiado pela graça para portar o poder do Anel Prístino.',
      'FromSoftware',
      550000,
      new Preco(249.90, 'BRL'),
      new Categoria('RPG de Ação', 'Souls-like'),
      new ClassificacaoIndicativa('16+'),
      new RequisitosTecnicos('Windows 10', 'NVIDIA GTX 1060 / RX 580', '12GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg'
    ),
    new Jogo(
      'rdr-0000-0000-0000-000000000007',
      'Red Dead Redemption 2',
      'Uma história épica de honra e lealdade no alvorecer da era moderna, focada em Arthur Morgan e a gangue Van der Linde.',
      'Rockstar Games',
      800000,
      new Preco(299.90, 'BRL'),
      new Categoria('Ação', 'Mundo Aberto'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10', 'NVIDIA GTX 1060 / RX 480', '12GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg'
    ),
    new Jogo(
      'hds-0000-0000-0000-000000000008',
      'Hades',
      'Desafie o deus dos mortos neste roguelike de exploração de masmorras dos criadores de Bastion e Transistor.',
      'Supergiant Games',
      250000,
      new Preco(73.99, 'BRL'),
      new Categoria('Ação', 'Roguelike'),
      new ClassificacaoIndicativa('14+'),
      new RequisitosTecnicos('Windows 7 SP1', '1GB VRAM / OpenGL 2.1+', '4GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900.jpg'
    ),
    new Jogo(
      'hlk-0000-0000-0000-000000000009',
      'Hollow Knight',
      'Forje seu próprio caminho neste clássico de ação e aventura em 2D que se passa num vasto mundo arruinado.',
      'Team Cherry',
      320000,
      new Preco(46.99, 'BRL'),
      new Categoria('Metroidvania', 'Ação'),
      new ClassificacaoIndicativa('10+'),
      new RequisitosTecnicos('Windows 7', 'NVIDIA GeForce 9800GTX', '4GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg'
    ),
    new Jogo(
      'sdv-0000-0000-0000-000000000010',
      'Stardew Valley',
      'Você herdou a velha fazenda do seu avô em Stardew Valley. Armado com ferramentas de segunda mão, você deve começar sua nova vida.',
      'ConcernedApe',
      600000,
      new Preco(24.99, 'BRL'),
      new Categoria('Simulação', 'RPG'),
      new ClassificacaoIndicativa('Livre'),
      new RequisitosTecnicos('Windows Vista', '256 mb video memory', '2GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900.jpg'
    ),
    new Jogo(
      'gta-0000-0000-0000-000000000011',
      'Grand Theft Auto V',
      'Quando um malandro de rua, um ladrão de bancos e um psicopata se envolvem com o mundo do crime, eles devem realizar golpes ousados para sobreviver.',
      'Rockstar North',
      1200000,
      new Preco(82.50, 'BRL'),
      new Categoria('Ação', 'Mundo Aberto'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 660 / HD 7870', '8GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg'
    ),
    new Jogo(
      'sek-0000-0000-0000-000000000012',
      'Sekiro: Shadows Die Twice',
      'Abra um caminho de vingança nesta aventura de ação premiada. Recupere sua honra matando com perspicácia.',
      'FromSoftware',
      200000,
      new Preco(199.90, 'BRL'),
      new Categoria('Ação', 'Souls-like'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 970 / RX 570', '8GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900.jpg'
    ),
    new Jogo(
      're4-0000-0000-0000-000000000013',
      'Resident Evil 4',
      'A sobrevivência é apenas o começo. Seis anos se passaram desde o desastre biológico em Raccoon City.',
      'Capcom',
      150000,
      new Preco(249.00, 'BRL'),
      new Categoria('Ação', 'Terror de Sobrevivência'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 1050 Ti / RX 560', '8GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900.jpg'
    ),
    new Jogo(
      'gow-0000-0000-0000-000000000014',
      'God of War',
      'Com a vingança contra os deuses do Olimpo no passado, Kratos agora vive no reino das divindades nórdicas.',
      'Santa Monica Studio',
      110000,
      new Preco(199.90, 'BRL'),
      new Categoria('Ação', 'Aventura'),
      new ClassificacaoIndicativa('18+'),
      new RequisitosTecnicos('Windows 10 64-bit', 'NVIDIA GTX 1060 / RX 570', '8GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg'
    ),
    new Jogo(
      'dc-0000-0000-0000-000000000015',
      'Dead Cells',
      'Dead Cells é um jogo de plataforma de ação roguelite estilo Metroidvania. Você vai explorar um castelo mutante.',
      'Motion Twin',
      180000,
      new Preco(47.49, 'BRL'),
      new Categoria('Roguelite', 'Plataforma'),
      new ClassificacaoIndicativa('12+'),
      new RequisitosTecnicos('Windows 7+', 'Nvidia 450 GTS / Radeon HD 5750', '2GB'),
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/588650/library_600x900.jpg'
    )
  ];

  constructor(private readonly cacheService: JogoCacheService) {}

  async findAll(): Promise<Jogo[]> {
    this.logger.log({ msg: 'Buscando lista de todos os jogos', action: 'findAll' });
    const tempoInicio = performance.now(); 
    const cacheKey = 'produto:lista:todas';
    const cachedList = await this.cacheService.get<Jogo[]>(cacheKey);
    if (cachedList) {
      const tempoFim = performance.now();
      this.cacheService.registrarMetricaTempo(true, tempoFim - tempoInicio);
      this.logger.log({ msg: 'Lista de jogos recuperada do cache (HIT)', action: 'findAll', cacheHit: true }); 
      return cachedList;
    }
    const dadosBanco = this.jogos;
    await this.cacheService.set(cacheKey, dadosBanco, 120);
    const tempoFim = performance.now();
    this.cacheService.registrarMetricaTempo(false, tempoFim - tempoInicio); 
    this.logger.log({ msg: 'Lista de jogos recuperada da base de dados (MISS)', action: 'findAll', cacheHit: false });
    return dadosBanco;
  }

  async findOne(id: string): Promise<Jogo> {
    this.logger.log({ msg: 'Buscando jogo por ID', action: 'findOne', jogoId: id });
    const tempoInicio = performance.now(); 
    const cacheKey = `produto:item:${id}`;
    const cachedJogo = await this.cacheService.get<Jogo>(cacheKey);
    if (cachedJogo) {
      const tempoFim = performance.now();
      this.cacheService.registrarMetricaTempo(true, tempoFim - tempoInicio); 
      this.logger.log({ msg: 'Jogo recuperado do cache (HIT)', action: 'findOne', cacheHit: true, jogoId: id });
      return cachedJogo;
    }
    const jogo = this.jogos.find((j) => j.jogoId === id);
    if (!jogo) {
      this.logger.warn({ msg: 'Jogo não encontrado', action: 'findOne', jogoId: id });
      throw new NotFoundException(`Jogo com ID ${id} não encontrado`);
    }
    await this.cacheService.set(cacheKey, jogo, 300);
    const tempoFim = performance.now();
    this.cacheService.registrarMetricaTempo(false, tempoFim - tempoInicio); 
    this.logger.log({ msg: 'Jogo recuperado da base de dados (MISS)', action: 'findOne', cacheHit: false, jogoId: id });
    return jogo;
  }

  async create(dto: CreateJogoDto): Promise<Jogo> {
    const jogo = new Jogo(
      randomUUID(), dto.titulo, dto.descricao, dto.desenvolvedora, 0,
      new Preco(dto.preco.valor, dto.preco.moeda),
      new Categoria(dto.categoria.nome, 'Categoria do jogo'),
      new ClassificacaoIndicativa(dto.classificacaoIndicativa.faixa),
      new RequisitosTecnicos(dto.requisitosTecnicos.sistemaOperacional, dto.requisitosTecnicos.placaDeVideo, dto.requisitosTecnicos.memoriaRam),
    );
    this.jogos.push(jogo);
    await this.cacheService.invalidate('produto:lista:todas');
    return jogo;
  }

  async update(id: string, dto: CreateJogoDto): Promise<Jogo> {
    const index = this.jogos.findIndex((j) => j.jogoId === id);
    if (index === -1) throw new NotFoundException('Jogo não encontrado');
    const jogoAtualizado = new Jogo(
      id, dto.titulo, dto.descricao, dto.desenvolvedora, this.jogos[index].numeroAnalises,
      new Preco(dto.preco.valor, dto.preco.moeda),
      new Categoria(dto.categoria.nome, 'Categoria do jogo'),
      new ClassificacaoIndicativa(dto.classificacaoIndicativa.faixa),
      new RequisitosTecnicos(dto.requisitosTecnicos.sistemaOperacional, dto.requisitosTecnicos.placaDeVideo, dto.requisitosTecnicos.memoriaRam),
    );
    this.jogos[index] = jogoAtualizado;
    await this.cacheService.invalidate(`produto:item:${id}`);
    await this.cacheService.invalidate('produto:lista:todas');
    return jogoAtualizado;
  }

  async delete(id: string) {
    const index = this.jogos.findIndex((j) => j.jogoId === id);
    if (index === -1) throw new NotFoundException('Jogo não encontrado');
    this.jogos.splice(index, 1);
    await this.cacheService.invalidate(`produto:item:${id}`);
    await this.cacheService.invalidate('produto:lista:todas');
    return { message: 'Jogo removido com sucesso' };
  }

  async obterMétricasDoCache() { return this.cacheService.obterEstatisticas(); }
}