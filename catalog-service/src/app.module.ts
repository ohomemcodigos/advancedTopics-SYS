import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { AppService } from './app.service';
import { JogoController } from './domain/jogo/controller/jogo.controller';
import { JogoService } from './domain/jogo/services/jogo.service';
import { JogoCacheService } from './domain/jogo/services/jogo-cache.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register(),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-correlation-id'] || req.id,
        customProps: (req) => ({
          correlationId: req.headers['x-correlation-id'],
          environment: process.env.NODE_ENV,
        }),
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    TerminusModule,
    TypeOrmModule.forRoot({
      type: 'mssql',
      // Correção: Agora ele aponta para localhost por padrão quando rodado no terminal
      host: process.env.DB_HOST || 'localhost',
      port: 1433,
      username: 'sa',
      password: process.env.DB_PASSWORD || 'MasterKey@123!',
      database: 'catalog_db',
      autoLoadEntities: true,
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 30000,
    }),
  ],
  controllers: [AppController, JogoController, HealthController],
  providers: [AppService, JogoService, JogoCacheService],
})
export class AppModule {}