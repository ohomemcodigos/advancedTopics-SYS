import { Usuario } from './usuario.entity';
import { Credenciais } from '../objetos_de_valor/credenciais';
import { Regiao } from '../objetos_de_valor/regiao';
import { Perfil } from '../objetos_de_valor/perfil';

describe('Usuario', () => {
    it('deve instanciar um usuario com UUID e atributos de perfil', () => {
        const credenciais = new Credenciais('usuario@email.com', 'senhaHash123');
        const regiao = new Regiao('Brasil');
        const perfil = new Perfil('João', 'joao_dev', 'url_avatar.png');

        const usuario = new Usuario('123e4567-e89b-12d3-a456-426614174000', credenciais, regiao, perfil);

        expect(usuario.id).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(usuario.perfil.nome).toBe('João');
    });

    it('deve conter credenciais validas de autenticacao', () => {
        const credenciais = new Credenciais('teste@email.com', 'hash');

        expect(credenciais.email).toBe('teste@email.com');
        expect(credenciais.senhaHash).toBe('hash');
    });
});