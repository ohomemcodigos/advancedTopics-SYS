import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // 1. Carrega variáveis de ambiente (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Configura a conexão com SQL Server
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'sqlserver', // Nome do serviço no docker-compose
      port: 1433,
      username: 'sa',
      password: process.env.DB_PASSWORD, // Use variáveis de ambiente!
      database: 'user_db',
      autoLoadEntities: true,
      synchronize: false,
      options: {
        encrypt: false, // Necessário se não tiver certificado SSL válido
        trustServerCertificate: true,
      },
    }),

    // 3. Health Checks
    TerminusModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}