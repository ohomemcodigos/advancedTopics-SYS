import { Preco } from '../objetos_de_valor/preco.vo';
import { Categoria } from '../objetos_de_valor/categoria.vo';
import { ClassificacaoIndicativa } from '../objetos_de_valor/classificacao-indicativa.vo';
import { RequisitosTecnicos } from '../objetos_de_valor/requisitos-tecnicos.vo';
import { ApiProperty } from '@nestjs/swagger';

export class Jogo {
  @ApiProperty({ example: 'JOGO-01', description: 'Identificador único do jogo' })
  public readonly jogoId: string;

  @ApiProperty({ example: 'Hollow Knight', description: 'Título do jogo' })
  public titulo: string;

  @ApiProperty({ example: 'Descrição do jogo', description: 'Descrição detalhada' })
  public descricao: string;

  @ApiProperty({ example: 'Team Cherry', description: 'Estúdio desenvolvedor' })
  public desenvolvedora: string;

  @ApiProperty({ example: 12000, description: 'Número de análises' })
  public numeroAnalises: number;

  @ApiProperty({ description: 'Preço do jogo' })
  public preco: Preco;

  @ApiProperty({ description: 'Categoria do jogo' })
  public categoria: Categoria;

  @ApiProperty({ description: 'Classificação indicativa' })
  public classificacaoIndicativa: ClassificacaoIndicativa;

  @ApiProperty({ description: 'Requisitos técnicos' })
  public requisitosTecnicos: RequisitosTecnicos;

  @ApiProperty({ description: 'URL da imagem de capa do jogo' })
  public imagem: string;

  constructor(
    jogoId: string,
    titulo: string,
    descricao: string,
    desenvolvedora: string,
    numeroAnalises: number,
    preco: Preco,
    categoria: Categoria,
    classificacaoIndicativa: ClassificacaoIndicativa,
    requisitosTecnicos: RequisitosTecnicos,
    imagem: string = 'https://placehold.co/300x400/1e1e2e/a688fa?text=Sem+Imagem', // Valor padrão para não quebrar rotas antigas
  ) {
    if (!jogoId) throw new Error('O SKU(JogoId) é obrigatório.');
    if (!titulo || titulo.trim() === '') throw new Error('O título do jogo é obrigatório.');
    if (!descricao || descricao.trim() === '') throw new Error('A descrição é obrigatória.');
    if (!preco) throw new Error('O preço do jogo é obrigatório.');

    this.jogoId = jogoId;
    this.titulo = titulo;
    this.descricao = descricao;
    this.desenvolvedora = desenvolvedora;
    this.numeroAnalises = numeroAnalises;
    this.preco = preco;
    this.categoria = categoria;
    this.classificacaoIndicativa = classificacaoIndicativa;
    this.requisitosTecnicos = requisitosTecnicos;
    this.imagem = imagem;
  }
}