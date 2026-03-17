import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { JogoService } from './jogo.service';
import { CreateJogoDto } from './dto/create-jogo.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Jogos')
@Controller('jogos')
export class JogoController {
  constructor(private readonly jogoService: JogoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os jogos', description: 'Retorna uma lista completa dos jogos cadastrados no catálogo.' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.jogoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um jogo por ID', description: 'Retorna os detalhes de um jogo específico baseado no seu identificador único.' })
  @ApiParam({ name: 'id', description: 'O ID do jogo que você deseja buscar', example: '1' })
  @ApiResponse({ status: 200, description: 'Jogo encontrado.' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.jogoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo jogo', description: 'Cria um novo registro de jogo no sistema.' })
  @ApiResponse({ status: 201, description: 'Jogo cadastrado com sucesso.', type: CreateJogoDto })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  create(@Body() dto: CreateJogoDto) {
    return this.jogoService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um jogo', description: 'Atualiza as informações de um jogo existente.' })
  @ApiParam({ name: 'id', description: 'ID do jogo a ser editado' })
  @ApiResponse({ status: 200, description: 'Jogo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado para atualização.' })
  update(@Param('id') id: string, @Body() dto: CreateJogoDto) {
    return this.jogoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um jogo', description: 'Exclui permanentemente um jogo do catálogo.' })
  @ApiParam({ name: 'id', description: 'ID do jogo a ser removido' })
  @ApiResponse({ status: 204, description: 'Jogo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado.' })
  delete(@Param('id') id: string) {
    return this.jogoService.delete(id);
  }
}