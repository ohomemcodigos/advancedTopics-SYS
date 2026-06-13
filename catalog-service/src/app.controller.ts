import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('version')
  @ApiOperation({ summary: 'Retorna a versão atual da API' })
  getVersion() {
    return {
      version: process.env.APP_VERSION || '0.1.0',
    };
  }

  @Get('jogos')
  @ApiOperation({ summary: 'Retorna a lista de jogos disponíveis na loja' })
  getJogos() {
    return this.appService.getJogos();
  }
}