import { Module } from '@nestjs/common'
import { JogoController } from './jogo.controller'
import { JogoService } from './jogo.service'

@Module({
  controllers: [JogoController],
  providers: [JogoService],
})
export class JogoModule {}