import { Controller, Get, Post, Body, Param, Delete, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './domain/usuario/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TipoPerfil } from './domain/usuario/entidades/usuario.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario criado com sucesso' })
  async create(@Body() dto: CreateUserDto & { tipoPerfil?: TipoPerfil }) {
    return await this.userService.create(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autenticar um usuario no sistema' })
  @ApiResponse({ status: 200, description: 'Autenticacao bem-sucedida' })
  async login(@Body() dto: any) {
    return await this.userService.login(dto.email, dto.senha);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuarios' })
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuario por ID' })
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um usuario' })
  async remove(
    @Param('id') id: string,
    @Headers('x-role') requesterRole: string,
  ) {
    return await this.userService.remove(id, requesterRole);
  }
}