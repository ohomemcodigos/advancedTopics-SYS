import { describe, it, expect } from '@jest/globals';
import { Jogo } from './jogo.entity';
import { Preco } from '../objetos_de_valor/preco.vo';
import { RequisitosTecnicos } from '../objetos_de_valor/requisitos-tecnicos.vo';
import { ClassificacaoIndicativa } from '../objetos_de_valor/classificacao-indicativa.vo';
import { Categoria } from '../objetos_de_valor/categoria.vo';

describe('Jogo (Entidade)', () => {
  it('deve criar um jogo com ID e preco corretamente', () => {
    // Arrange
    const preco = new Preco(199.90, 'BRL');
    const categoria = new Categoria('RPG', 'Role-playing game');
    const classificacao = new ClassificacaoIndicativa('16+'); // Corrigido para '16+'
    const requisitos = new RequisitosTecnicos('Windows 10', 'GTX 1060', '8GB');

    // Act
    const jogo = new Jogo(
      'SKU-123',
      'Meu RPG',
      'Descricao do jogo',
      'DevStudio',
      0,
      preco,
      categoria,
      classificacao,
      requisitos
    );

    // Assert
    expect(jogo.jogoId).toBe('SKU-123');
    expect(jogo.preco.valor).toBe(199.90);
  });

  it('deve armazenar os requisitos tecnicos corretamente', () => {
    // Arrange & Act
    const requisitos = new RequisitosTecnicos('Linux', 'RTX 3060', '16GB');

    // Assert
    expect(requisitos.sistemaOperacional).toBe('Linux');
    expect(requisitos.gpu).toBe('RTX 3060'); 
    expect(requisitos.ram).toBe('16GB');
  });
});