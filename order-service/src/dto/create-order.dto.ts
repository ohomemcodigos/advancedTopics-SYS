import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: ['uuid-1', 'uuid-2'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) // Garante que cada item do array é uma string
  jogosIds: string[];

  @ApiProperty({ example: 'PIX', enum: ['PIX', 'CARTAO', 'BOLETO'] })
  @IsEnum(['PIX', 'CARTAO', 'BOLETO'], { message: 'Método de pagamento inválido' })
  @IsNotEmpty()
  metodoPagamento: 'PIX' | 'CARTAO' | 'BOLETO';
}