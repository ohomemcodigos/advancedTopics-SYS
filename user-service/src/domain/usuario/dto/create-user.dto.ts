import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'hennan@email.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @IsNotEmpty()
  senha!: string;

  @ApiProperty({ example: 'Hennan Falcão' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 'hhfalcao' })
  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @ApiProperty({ example: 'https://avatar.com/foto.png' })
  @IsUrl()
  avatarUrl!: string;

  @ApiProperty({ example: 'Brasil' })
  @IsString()
  @IsNotEmpty()
  pais!: string;
}
