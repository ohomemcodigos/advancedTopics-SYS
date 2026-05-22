import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import { AppService } from './app.service';
import { JogoController } from './domain/jogo/controller/jogo.controller';
import { JogoService } from './domain/jogo/services/jogo.service';
import { JogoCacheService } from './domain/jogo/services/jogo-cache.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),
  ],
  controllers: [AppController, JogoController],
  providers: [
    AppService, 
    JogoService, 
    JogoCacheService
  ],
})
export class AppModule {}