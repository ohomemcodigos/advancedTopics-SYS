import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  checkLiveness() {
    // Retorna status 200 OK apenas confirmando que o processo está vivo
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // Houve uma troca do MemoryHealthIndicator pela verificação real de Banco de Dados
      () => this.db.pingCheck('database'),
    ]);
  }
}