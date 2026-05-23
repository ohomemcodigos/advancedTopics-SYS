export class Categoria {
  constructor(
    public readonly nomeCategoria: string,
    public readonly descricao: string,
  ) {
    if (!nomeCategoria) throw new Error('O nome da categoria é obrigatório.');
    if (!descricao) throw new Error('A descrição da categoria é obrigatória.');//Não é melhor a descrição pertencer a entidade Jogo?
  }
}
