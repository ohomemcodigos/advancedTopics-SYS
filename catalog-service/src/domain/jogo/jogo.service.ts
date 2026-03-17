import { Injectable } from '@nestjs/common'
import { Jogo } from '../../domain/jogo/entidades/jogo.entity'
import { CreateJogoDto } from './dto/create-jogo.dto'
import { v4 as uuid } from 'uuid'

import { Preco } from '../../domain/jogo/objetos_de_valor/preco.vo'
import { Categoria } from '../../domain/jogo/objetos_de_valor/categoria.vo'
import { ClassificacaoIndicativa } from '../../domain/jogo/objetos_de_valor/classificacao-indicativa.vo'
import { RequisitosTecnicos } from '../../domain/jogo/objetos_de_valor/requisitos-tecnicos.vo'

@Injectable()
export class JogoService {

  private jogos: Jogo[] = []

  findAll(): Jogo[] {
    return this.jogos
  }

  findOne(id: string): Jogo | undefined {
    return this.jogos.find(j => j.jogoId === id)
  }

  create(dto: CreateJogoDto): Jogo {

  const jogo = new Jogo(
    uuid(),
    dto.titulo,
    dto.descricao,
    dto.desenvolvedora,
    0,
    new Preco(dto.preco, 'BRL'),
    new Categoria(dto.categoria, 'Categoria do jogo'),
    new ClassificacaoIndicativa(dto.classificacaoIndicativa),
    new RequisitosTecnicos(
      dto.requisitosTecnicos,
      'GPU padrão',
      '8GB'
    )
  )

  this.jogos.push(jogo)

  return jogo
 }

  update(id: string, dto: CreateJogoDto): Jogo {

  const index = this.jogos.findIndex(j => j.jogoId === id)

  if (index === -1) {
    throw new Error('Jogo não encontrado')
  }

  const jogoAtualizado = new Jogo(
    id,
    dto.titulo,
    dto.descricao,
    dto.desenvolvedora,
    this.jogos[index].numeroAnalises,
    new Preco(dto.preco, 'BRL'),
    new Categoria(dto.categoria, 'Categoria do jogo'),
    new ClassificacaoIndicativa(dto.classificacaoIndicativa),
    new RequisitosTecnicos(
      dto.requisitosTecnicos,
      'GPU padrão',
      '8GB'
    )
  )

  this.jogos[index] = jogoAtualizado

  return jogoAtualizado
 }

  delete(id: string) {

    const index = this.jogos.findIndex(j => j.jogoId === id)

    if (index === -1) {
      throw new Error('Jogo não encontrado')
    }

    this.jogos.splice(index, 1)

    return { message: 'Jogo removido com sucesso' }
  }

}