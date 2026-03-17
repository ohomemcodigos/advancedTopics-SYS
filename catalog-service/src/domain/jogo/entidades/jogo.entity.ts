import { Preco } from '../objetos_de_valor/preco.vo';
import { Categoria } from '../objetos_de_valor/categoria.vo';
import { ClassificacaoIndicativa } from '../objetos_de_valor/classificacao-indicativa.vo';
import { RequisitosTecnicos } from '../objetos_de_valor/requisitos-tecnicos.vo';
import { ApiProperty } from '@nestjs/swagger';

export class Jogo {

  @ApiProperty({
    example: "JOGO-01",
    description: "Identificador único do jogo"
  })
  public readonly jogoId: string;

  @ApiProperty({
    example: "Hollow Knight",
    description: "Título do jogo"
  })
  public titulo: string;

  @ApiProperty({
    example: "Hollow Knight é um jogo de ação e aventura em 2D desenvolvido pela Team Cherry. Explore um vasto mundo subterrâneo cheio de criaturas, segredos e desafios enquanto desvenda a história de um reino esquecido.",
    description: "Descrição do jogo"
  })
  public descricao: string;

  @ApiProperty({
    example: "Team Cherry",
    description: "Estúdio desenvolvedor do jogo"
  })
  public desenvolvedora: string;

  @ApiProperty({
    example: 12000,
    description: "Número de análises feitas pelos usuários"
  })
  public numeroAnalises: number;

  @ApiProperty({
    description: "Objeto de valor que representa o preço do jogo"
  })
  public preco: Preco;

  @ApiProperty({
    description: "Categoria do jogo"
  })
  public categoria: Categoria;

  @ApiProperty({
    description: "Classificação indicativa"
  })
  public classificacaoIndicativa: ClassificacaoIndicativa;

  @ApiProperty({
    description: "Requisitos técnicos para rodar o jogo"
  })
  public requisitosTecnicos: RequisitosTecnicos;

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
  ) {
    if (!jogoId) throw new Error('O SKU(JogoId) é obrigatório.');
    if (!titulo || titulo.trim() === '')
      throw new Error('O título do jogo é obrigatório.');
    if (!descricao || descricao.trim() === '')
      throw new Error('A descrição do jogo é obrigatória.');
    if (!desenvolvedora || desenvolvedora.trim() === '')
      throw new Error('A desenvolvedora do jogo é obrigatória.');
    if (numeroAnalises < 0)
      throw new Error('O número de análises não pode ser negativo.');

    if (!preco) throw new Error('O preço do jogo é obrigatório.');
    if (!categoria) throw new Error('A categoria do jogo é obrigatória.');
    if (!classificacaoIndicativa)
      throw new Error('A classificação indicativa do jogo é obrigatória.');
    if (!requisitosTecnicos)
      throw new Error('Os requisitos técnicos do jogo são obrigatórios.');

    this.jogoId = jogoId;
    this.titulo = titulo;
    this.descricao = descricao;
    this.desenvolvedora = desenvolvedora;
    this.numeroAnalises = numeroAnalises;
    this.preco = preco;
    this.categoria = categoria;
    this.classificacaoIndicativa = classificacaoIndicativa;
    this.requisitosTecnicos = requisitosTecnicos;
  }
}