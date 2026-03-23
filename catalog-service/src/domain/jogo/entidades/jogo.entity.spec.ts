import { Jogo } from './jogo.entity';
import { Preco } from '../objetos_de_valor/preco';
import { RequisitosTecnicos } from '../objetos_de_valor/requisitos_tecnicos';
import { ClassificacaoIndicativa } from '../objetos_de_valor/classificacao_indicativa';
import { Categoria } from '../objetos_de_valor/categoria';

describe('Jogo', () => {
    it('deve criar um jogo com SKU e preco', () => {
        const preco = new Preco(199.90, 'BRL');
        const requisitos = new RequisitosTecnicos('Windows 10', 'GTX 1060', '8GB');
        const classificacao = new ClassificacaoIndicativa('16+');
        const categoria = new Categoria('RPG', 'Role-playing game');

        const jogo = new Jogo('SKU-123', 'Meu RPG', 'Descricao do jogo', 'DevStudio', 0, preco, requisitos, classificacao, categoria);

        expect(jogo.id).toBe('SKU-123');
        expect(jogo.preco.valor).toBe(199.90);
        expect(jogo.preco.moeda).toBe('BRL');
    });

    it('deve armazenar os requisitos tecnicos corretamente', () => {
        const requisitos = new RequisitosTecnicos('Linux', 'RTX 3060', '16GB');

        expect(requisitos.sistemaOperacional).toBe('Linux');
        expect(requisitos.gpu).toBe('RTX 3060');
        expect(requisitos.ram).toBe('16GB');
    });
});