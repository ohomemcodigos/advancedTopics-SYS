import { Controller, Get } from '@nestjs/common';
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
  @Get()
  @ApiOperation({ summary: 'Retorna metadados de versão do catalog-service' })
  getVersion(): VersionDto {
    return {
      version: process.env.APP_VERSION ?? '0.1.0-dev',
      environment: process.env.NODE_ENV ?? 'development',
      buildDate: new Date().toISOString(),
      service: 'catalog-service',
    };
  }
}
