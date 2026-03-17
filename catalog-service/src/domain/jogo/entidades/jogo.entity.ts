import { Preco } from '../objetos_de_valor/preco.vo';
import { Categoria } from '../objetos_de_valor/categoria.vo';
import { ClassificacaoIndicativa } from '../objetos_de_valor/classificacao-indicativa.vo';
import { RequisitosTecnicos } from '../objetos_de_valor/requisitos-tecnicos.vo';

export class Jogo {
  constructor(
    public readonly jogoId: string,
    public titulo: string,
    public descricao: string,
    public desenvolvedora: string,
    public numeroAnalises: number,
    public preco: Preco,
    public categoria: Categoria,
    public classificacaoIndicativa: ClassificacaoIndicativa,
    public requisitosTecnicos: RequisitosTecnicos,
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
  }
}
