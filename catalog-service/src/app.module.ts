import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { JogoController } from './domain/jogo/controller/jogo.controller';
import { JogoService } from './domain/jogo/services/jogo.service';

@Module({
  imports: [],
  controllers: [AppController, JogoController],
  providers: [AppService, JogoService],
})
export class AppModule {}