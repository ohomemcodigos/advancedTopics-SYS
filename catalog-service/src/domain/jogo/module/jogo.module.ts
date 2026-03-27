import { Module } from '@nestjs/common';
import { JogoController } from '../controller/jogo.controller';
import { JogoService } from '../services/jogo.service';

@Module({
  controllers: [JogoController],
  providers: [JogoService],
})
export class JogoModule {}