import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Usuario, TipoPerfil } from './domain/usuario/entidades/usuario.entity';
import { Credenciais } from './domain/usuario/objetos_de_valor/credenciais.vo';
import { Perfil } from './domain/usuario/objetos_de_valor/perfil.vo';
import { Regiao } from './domain/usuario/objetos_de_valor/regiao.vo';
import { CreateUserDto } from './domain/usuario/dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    this.logger.log({
      msg: 'Buscando lista de todos os usuarios',
      action: 'findAll',
    });

    return await this.userRepository.find();
  }

  async findOne(id: string): Promise<Usuario> {
    this.logger.log({
      msg: 'Buscando usuario por ID',
      action: 'findOne',
      usuarioId: id,
    });

    const user = await this.userRepository.findOne({
      where: { usuarioId: id },
    });

    if (!user) {
      this.logger.warn({
        msg: 'Usuario nao encontrado',
        action: 'findOne',
        usuarioId: id,
      });
      throw new NotFoundException(`Usuario com ID ${id} nao encontrado`);
    }

    this.logger.log({
      msg: 'Usuario encontrado com sucesso',
      action: 'findOne',
      usuarioId: id,
    });
    return user;
  }

  async create(dto: CreateUserDto & { tipoPerfil?: TipoPerfil }): Promise<Usuario> {
    try {
      this.logger.log({
        msg: 'Iniciando criacao de usuario',
        action: 'create',
        email: dto.email,
        pais: dto.pais,
      });

      const emailExists = await this.userRepository.findOne({
        where: { credenciais: { email: dto.email } },
      });

      if (emailExists) {
        throw new BadRequestException('Este e-mail já está sendo utilizado por outro usuário.');
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
        dto.tipoPerfil || TipoPerfil.CLIENTE
      );

      const savedUser = await this.userRepository.save(newUser);

      this.logger.log({
        msg: 'Usuario criado com sucesso',
        action: 'create',
        usuarioId: savedUser.usuarioId,
        perfil: savedUser.tipoPerfil,
      });
      return savedUser;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error instanceof Error && error.message.includes('inválido')) {
        throw new BadRequestException(error.message);
      }

      this.logger.error({ msg: 'Erro inesperado no cadastro', error });
      throw error;
    }
  }

  async login(email: string, senhaAberta: string): Promise<Usuario> {
    this.logger.log({
      msg: 'Tentativa de login recebida',
      action: 'login',
      email,
    });

    const user = await this.userRepository.findOne({
      where: { credenciais: { email } },
    });

    if (!user) {
      this.logger.warn({
        msg: 'Falha no login: email nao encontrado',
        action: 'login',
        email,
      });
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const senhaValida = await bcrypt.compare(senhaAberta, user.credenciais.senhaHash);

    if (!senhaValida) {
      this.logger.warn({
        msg: 'Falha no login: senha incorreta',
        action: 'login',
        email,
      });
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    this.logger.log({
      msg: 'Login efetuado com sucesso',
      action: 'login',
      usuarioId: user.usuarioId,
    });

    return user;
  }

  async remove(id: string, requesterRole: string): Promise<{ message: string }> {
    this.logger.log({
      msg: 'Iniciando verificacao de seguranca para remocao',
      action: 'remove',
      usuarioId: id,
      requesterRole,
    });

    if (requesterRole !== TipoPerfil.ADMIN) {
      this.logger.warn({
        msg: 'Acesso negado: Apenas administradores podem remover perfis',
        action: 'remove',
        usuarioId: id,
      });
      throw new ForbiddenException('Acao nao permitida. Apenas administradores podem remover perfis do sistema.');
    }

    const user = await this.userRepository.findOne({
      where: { usuarioId: id },
    });

    if (!user) {
      this.logger.warn({
        msg: 'Falha ao remover: Usuario nao encontrado',
        action: 'remove',
        usuarioId: id,
      });
      throw new NotFoundException('Usuario nao encontrado');
    }

    await this.userRepository.remove(user);

    this.logger.log({
      msg: 'Usuario removido do banco de dados com sucesso',
      action: 'remove',
      usuarioId: id,
    });
    return { message: 'Usuario removido com sucesso' };
  }
}