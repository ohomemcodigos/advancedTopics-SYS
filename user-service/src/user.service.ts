import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Usuario } from './domain/usuario/entidades/usuario.entity';
import { Credenciais } from './domain/usuario/objetos_de_valor/credenciais.vo';
import { Perfil } from './domain/usuario/objetos_de_valor/perfil.vo';
import { Regiao } from './domain/usuario/objetos_de_valor/regiao.vo';
import { CreateUserDto } from './domain/usuario/dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private users: Usuario[] = [];

  findAll(): Usuario[] {
    this.logger.log({
      msg: 'Buscando lista de todos os usuários',
      action: 'findAll',
    });

    return this.users;
  }

  findOne(id: string): Usuario {
    this.logger.log({
      msg: 'Buscando usuário por ID',
      action: 'findOne',
      usuarioId: id,
    });

    const user = this.users.find((u) => u.usuarioId === id);
    if (!user) {
      this.logger.warn({
        msg: 'Usuário não encontrado',
        action: 'findOne',
        usuarioId: id,
      });
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    this.logger.log({
      msg: 'Usuário encontrado com sucesso',
      action: 'findOne',
      usuarioId: id,
    });
    return user;
  }

  async create(dto: CreateUserDto): Promise<Usuario> {
    this.logger.log({
      msg: 'Iniciando criação de usuário',
      action: 'create',
      email: dto.email,
      pais: dto.pais,
    });

    const emailExists = this.users.find(
      (u) => u.credenciais.email === dto.email,
    );

    if (emailExists) {
      this.logger.warn({
        msg: 'Tentativa de cadastro com email já existente',
        action: 'create',
        email: dto.email,
      });
      throw new BadRequestException('Email já cadastrado');
    }
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(dto.senha, saltRounds);

    const credenciais = new Credenciais(dto.email, senhaHash);
    const perfil = new Perfil(dto.nome, dto.nickname, dto.avatarUrl);
    const regiao = new Regiao(dto.pais);

    const newUser = new Usuario(
      randomUUID(),
      new Date(),
      credenciais,
      perfil,
      regiao,
    );

    this.users.push(newUser);
    this.logger.log({
      msg: 'Usuário criado com sucesso',
      action: 'create',
      usuarioId: newUser.usuarioId,
    });
    return newUser;
  }

  remove(id: string) {
    this.logger.log({
      msg: 'Iniciando remoção de usuário',
      action: 'remove',
      usuarioId: id,
    });

    const index = this.users.findIndex((u) => u.usuarioId === id);
    if (index === -1) {
      this.logger.warn({
        msg: 'Falha ao remover: Usuário não encontrado',
        action: 'remove',
        usuarioId: id,
      });
      throw new NotFoundException('Usuário não encontrado');
    }

    this.users.splice(index, 1);

    this.logger.log({
      msg: 'Usuário removido com sucesso',
      action: 'remove',
      usuarioId: id,
    });
    return { message: 'Usuário removido com sucesso' };
  }
}
