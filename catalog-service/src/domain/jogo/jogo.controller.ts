import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common'
import { JogoService } from './jogo.service'
import { CreateJogoDto } from './dto/create-jogo.dto'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Jogos')
@Controller('jogos')
export class JogoController {

  constructor(private readonly jogoService: JogoService) {}

  @Get()
  findAll() {
    return this.jogoService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jogoService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateJogoDto) {
    return this.jogoService.create(dto)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateJogoDto) {
    return this.jogoService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.jogoService.delete(id)
  }

}