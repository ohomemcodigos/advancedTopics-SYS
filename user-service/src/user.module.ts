import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './domain/usuario/entidades/usuario.entity';

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
      host: process.env.DB_HOST || 'localhost',
      port: 1433,
      username: 'sa',
      password: process.env.DB_PASSWORD || 'MasterKey@123!',
      database: 'master',
      autoLoadEntities: true,
      
      // CRÍTICO: Deixe true até a tabela ser criada no banco
      synchronize: true, 
      
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 30000,
    }),
    TypeOrmModule.forFeature([Usuario]),
  ],
  controllers: [UserController, HealthController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}