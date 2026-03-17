export class Preco {
  constructor(
    public readonly valor: number,
    public readonly moeda: string,
  ) {
    if (valor < 0) throw new Error('O valor do preço não pode ser negativo.');
    if (!moeda) throw new Error('A moeda do preço é obrigatória.');
  }
}
