import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: '1' })
  userId: string;

  @ApiProperty({ example: ['uuid-1', 'uuid-2'], type: [String] })
  jogosIds: string[];

  @ApiProperty({ example: 'PIX', enum: ['PIX', 'CARTAO', 'BOLETO'] })
  metodoPagamento: 'PIX' | 'CARTAO' | 'BOLETO';
}