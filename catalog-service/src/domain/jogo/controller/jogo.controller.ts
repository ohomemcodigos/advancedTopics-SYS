import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { JogoService } from '../services/jogo.service';
import { CreateJogoDto } from '../dto/create-jogo.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Jogos')
@Controller('jogos')
export class JogoController {
  constructor(private readonly jogoService: JogoService) {}

  @Get('cache/stats')
  @ApiOperation({ summary: 'Obter estatísticas operacionais do cache Redis' })
  @ApiResponse({ status: 200, description: 'Métricas calculadas com sucesso.' })
  getCacheStats() {
    return this.jogoService.obterMétricasDoCache();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os jogos' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.jogoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um jogo por ID' })
  @ApiParam({ name: 'id', description: 'O ID do jogo que você deseja buscar', example: '1' })
  @ApiResponse({ status: 200, description: 'Jogo encontrado.' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.jogoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo jogo' })
  @ApiResponse({ status: 201, description: 'Jogo cadastrado com sucesso.', type: CreateJogoDto })
  create(@Body() dto: CreateJogoDto) {
    return this.jogoService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um jogo' })
  update(@Param('id') id: string, @Body() dto: CreateJogoDto) {
    return this.jogoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um jogo' })
  delete(@Param('id') id: string) {
    return this.jogoService.delete(id);
  }
}