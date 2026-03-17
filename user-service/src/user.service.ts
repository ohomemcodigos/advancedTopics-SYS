import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  create(dto: CreateUserDto): User {
    const emailExists = this.users.find(u => u.email === dto.email);
    if (emailExists) {
      throw new BadRequestException('Este e-mail já está cadastrado');
    }

    const newUser = new User(dto.nome, dto.email, dto.cpf);
    this.users.push(newUser);
    return newUser;
  }

  remove(id: string) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new NotFoundException('Usuário não encontrado');
    }
    this.users.splice(index, 1);
    return { message: 'Usuário removido com sucesso' };
  }
}