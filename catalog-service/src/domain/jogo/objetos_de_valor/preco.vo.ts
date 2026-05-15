import { ApiProperty } from '@nestjs/swagger';

export class Preco {

  @ApiProperty({
    example: 59.90,
    description: 'Valor do jogo',
  })
  public readonly valor: number;

  @ApiProperty({
    example: 'BRL',
    description: 'Moeda do preço (ex: BRL, USD, EUR)',
  })
  public readonly moeda: string;

  constructor(
    valor: number,
    moeda: string,
  ) {

    if (valor < 0) throw new Error('O valor do preço não pode ser negativo.');
    if (!moeda) throw new Error('A moeda do preço é obrigatória.');

    this.valor = valor;
    this.moeda = moeda;
  }
}