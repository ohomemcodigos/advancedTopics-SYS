import { ApiProperty } from '@nestjs/swagger'

export class CreateJogoDto {

  @ApiProperty()
  titulo!: string

  @ApiProperty()
  descricao!: string

  @ApiProperty()
  desenvolvedora!: string

  @ApiProperty()
  preco!: number

  @ApiProperty()
  categoria!: string

  @ApiProperty()
  classificacaoIndicativa!: string

  @ApiProperty()
  requisitosTecnicos!: string

}