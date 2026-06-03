/* eslint-disable */
import { Usuario } from './usuario.entity';
import { Credenciais } from '../objetos_de_valor/credenciais.vo';
import { Regiao } from '../objetos_de_valor/regiao.vo';
import { Perfil } from '../objetos_de_valor/perfil.vo';
import { describe, it, expect } from '@jest/globals';

describe('Usuario', () => {
  it('deve instanciar um usuario com UUID e atributos de perfil', () => {
    const credenciais: Credenciais = new Credenciais(
      'usuario@email.com',
      'senhaHash123',
    );
    const regiao: Regiao = new Regiao('Brasil');
    const perfil: Perfil = new Perfil('João', 'joao_dev', 'url_avatar.png');
    const dataCriacao: Date = new Date();

    const usuario: Usuario = new Usuario(
      '123e4567-e89b-12d3-a456-426614174000',
      dataCriacao,
      credenciais,
      perfil,
      regiao,
    );

    expect(usuario.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(usuario.perfil.nome).toBe('João');
  });

  it('deve conter credenciais validas de autenticacao', () => {
    const credenciais: Credenciais = new Credenciais('teste@email.com', 'hash');

    expect(credenciais.email as string).toBe('teste@email.com');
    expect(credenciais.senhaHash as string).toBe('hash');
  });
});