import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller('api/v1')
export class AppController {
  
  @Get('version')
  @ApiOperation({ summary: 'Retorna a versão atual da API' })
  getVersion() {
    return {
      version: process.env.APP_VERSION || '0.1.0',
      environment: process.env.NODE_ENV || 'Development',
      buildDate: new Date().toISOString()
    };
  }
}