// order-service/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MicroserviceHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([]); // Apenas verifica se a app responde
  }

  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      () => this.microservice.pingCheck('rabbitmq', { 
        transport: 0, // Transport.RMQ
        options: { urls: ['amqp://rabbitmq:5672'] } 
      }),
      () => this.microservice.pingCheck('redis', { 
        transport: 1, // Transport.REDIS
        options: { host: 'redis', port: 6379 } 
      }),
    ]);
  }
}