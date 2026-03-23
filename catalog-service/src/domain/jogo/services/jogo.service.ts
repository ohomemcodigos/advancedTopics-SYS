import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Jogo } from '../entidades/jogo.entity';
import { CreateJogoDto } from '../dto/create-jogo.dto';
import { Preco } from '../objetos_de_valor/preco.vo';
import { Categoria } from '../objetos_de_valor/categoria.vo';
import { ClassificacaoIndicativa } from '../objetos_de_valor/classificacao-indicativa.vo';
import { RequisitosTecnicos } from '../objetos_de_valor/requisitos-tecnicos.vo';

@Injectable()
export class JogoService {
  private jogos: Jogo[] = [];

  findAll(): Jogo[] {
    return this.jogos;
  }

  // Ajustado para lançar erro se não encontrar [cite: 7, 72]
  findOne(id: string): Jogo {
    const jogo = this.jogos.find(j => j.jogoId === id);
    if (!jogo) throw new NotFoundException(`Jogo ${id} não encontrado`);
    return jogo;
  }

  create(dto: CreateJogoDto): Jogo {
    const jogo = new Jogo(
      randomUUID(),
      dto.titulo,
      dto.descricao,
      dto.desenvolvedora,
      0,
      new Preco(dto.preco.valor, dto.preco.moeda),
      new Categoria(dto.categoria.nome, 'Categoria do jogo'),
      new ClassificacaoIndicativa(dto.classificacaoIndicativa.faixa),
      new RequisitosTecnicos(
        dto.requisitosTecnicos.sistemaOperacional,
        dto.requisitosTecnicos.placaDeVideo,
        dto.requisitosTecnicos.memoriaRam,
      ),
    );
    this.jogos.push(jogo);
    return jogo;
  }

  update(id: string, dto: CreateJogoDto): Jogo {
    const index = this.jogos.findIndex(j => j.jogoId === id);
    if (index === -1) throw new NotFoundException('Jogo não encontrado');

    const jogoAtualizado = new Jogo(
      id,
      dto.titulo,
      dto.descricao,
      dto.desenvolvedora,
      this.jogos[index].numeroAnalises,
      new Preco(dto.preco.valor, dto.preco.moeda),
      new Categoria(dto.categoria.nome, 'Categoria do jogo'),
      new ClassificacaoIndicativa(dto.classificacaoIndicativa.faixa),
      new RequisitosTecnicos(
        dto.requisitosTecnicos.sistemaOperacional,
        dto.requisitosTecnicos.placaDeVideo,
        dto.requisitosTecnicos.memoriaRam,
      ),
    );
    this.jogos[index] = jogoAtualizado;
    return jogoAtualizado;
  }

  delete(id: string) {
    const index = this.jogos.findIndex(j => j.jogoId === id);
    if (index === -1) throw new NotFoundException('Jogo não encontrado');
    this.jogos.splice(index, 1);
    return { message: 'Jogo removido com sucesso' };
  }
}