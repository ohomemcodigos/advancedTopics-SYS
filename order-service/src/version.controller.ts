import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

interface VersionDto {
  version: string;
  environment: string;
  buildDate: string;
  service: string;
}

@ApiTags('version')
@Controller('api/v1/version')
export class VersionController {
  private readonly logger = new Logger(VersionController.name);

  @Get()
  @ApiOperation({ summary: 'Retorna metadados de versão do order-service' })
  getVersion(): VersionDto {
    this.logger.log('Rota de versão acessada com sucesso!');

    return {
      version: process.env.APP_VERSION ?? '0.1.0-dev',
      environment: process.env.NODE_ENV ?? 'development',
      buildDate: new Date().toISOString(),
      service: 'order-service',
    };
  }
}
