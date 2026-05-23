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
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),
    TerminusModule,
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'sqlserver',
      port: 1433,
      username: 'sa',
      password: 'MasterKey@123!',
      database: 'catalog_db',
      autoLoadEntities: true,
      synchronize: true,
      options: {
        encrypt: false,
      },
    }),
  ],
  controllers: [AppController, JogoController, HealthController],
  providers: [
    AppService,
    JogoService,
    JogoCacheService,
  ],
})
export class AppModule {}
