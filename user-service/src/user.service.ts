import {
  Injectable,
  BadRequestException,
  NotFoundException,
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
  private users: Usuario[] = [];

  findAll(): Usuario[] {
    return this.users;
  }

  findOne(id: string): Usuario {
    const user = this.users.find((u) => u.usuarioId === id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<Usuario> {
    const emailExists = this.users.find(
      (u) => u.credenciais.email === dto.email,
    );
    if (emailExists) throw new BadRequestException('Email já cadastrado');

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
    return newUser;
  }

  remove(id: string) {
    const index = this.users.findIndex((u) => u.usuarioId === id);
    if (index === -1) {
      throw new NotFoundException('Usuário não encontrado');
    }
    this.users.splice(index, 1);
    return { message: 'Usuário removido com sucesso' };
  }
}
