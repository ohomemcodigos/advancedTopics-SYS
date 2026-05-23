import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsPositive, 
  MinLength, 
  ValidateNested, 
  IsDefined,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Objetos de Valor ---

class PrecoDto {
  @ApiProperty({ description: 'Valor numérico', example: 149.90 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor!: number;

  @ApiProperty({ description: 'Moeda (ISO 4217)', example: 'BRL' })
  @IsString()
  @IsNotEmpty()
  moeda!: string;
}

class CategoriaDto {
  @ApiProperty({ description: 'Nome do gênero/categoria', example: 'RPG' })
  @IsString()
  @IsNotEmpty()
  nome!: string;
}

class ClassificacaoIndicativaDto {
  @ApiProperty({ 
    description: 'Faixa etária permitida', 
    example: '14',
    enum: ['L', '10', '12', '14', '16', '18'] 
  })
  @IsString()
  @IsNotEmpty()
  faixa!: string;
}

class RequisitosTecnicosDto {
  @ApiProperty({ example: 'Windows 10/11' })
  @IsString()
  sistemaOperacional!: string;

  @ApiProperty({ example: '16GB' })
  @IsString()
  memoriaRam!: string;

  @ApiProperty({ example: 'NVIDIA RTX 3060' })
  @IsString()
  placaDeVideo!: string;
}

// --- DTO Principal ---

export class CreateJogoDto {

  @ApiProperty({ description: 'O nome do jogo' })
  @IsString()
  @IsNotEmpty({ message: 'O título não pode estar vazio' })
  titulo!: string;

  @ApiProperty({ description: 'Breve descrição do jogo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'A descrição deve ter pelo menos 10 caracteres' })
  descricao!: string;

  @ApiProperty({ description: 'Nome da empresa desenvolvedora' })
  @IsString()
  @IsNotEmpty()
  desenvolvedora!: string;

  @ApiProperty({ type: PrecoDto })
  @ValidateNested()
  @Type(() => PrecoDto)
  @IsDefined()
  preco!: PrecoDto;

  @ApiProperty({ type: CategoriaDto })
  @ValidateNested()
  @Type(() => CategoriaDto)
  @IsDefined()
  categoria!: CategoriaDto;

  @ApiProperty({ type: ClassificacaoIndicativaDto })
  @ValidateNested()
  @Type(() => ClassificacaoIndicativaDto)
  @IsDefined()
  classificacaoIndicativa!: ClassificacaoIndicativaDto;

  @ApiProperty({ type: RequisitosTecnicosDto })
  @ValidateNested()
  @Type(() => RequisitosTecnicosDto)
  @IsDefined()
  requisitosTecnicos!: RequisitosTecnicosDto;
}