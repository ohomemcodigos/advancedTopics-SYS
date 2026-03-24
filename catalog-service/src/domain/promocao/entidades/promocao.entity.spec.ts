import { Promocao } from './promocao.entity';
import { Periodo } from '../objetos_de_valor/periodo.vo';

describe('Promocao Entity (Testes Unitários)', () => {
// Configurações auxiliares para criar datas
const hoje = new Date();

const ontem = new Date();
ontem.setDate(hoje.getDate() - 1);

const amanha = new Date();
amanha.setDate(hoje.getDate() + 1);

// Arrange: Criamos um Período válido e uma lista de jogos válida
const periodoValido = new Periodo(ontem, amanha);
const jogosValidos = ['jogo-1', 'jogo-2']; // Resolve o erro do 5º argumento

// --- CENÁRIO 1: Criação de Sucesso ---
it('deve criar uma promoção válida com status ativo', () => {
   // Arrange & Act
   const promocao = new Promocao('promo-1', 'Semana do RPG', 15, periodoValido, jogosValidos);

   // Assert
   expect(promocao.ativa).toBe(true);
   expect(promocao.desconto).toBe(15);
});

// --- CENÁRIO 2: Validação da Regra de Desconto ---
it('deve lançar erro se o desconto for zero ou negativo', () => {
   expect(() => {
   new Promocao('promo-2', 'Desconto Bugado', 0, periodoValido, jogosValidos);
   }).toThrow('Desconto deve ser entre 0 e 100.');
});

it('deve lançar erro se o desconto for 100 ou maior', () => {
   expect(() => {
   new Promocao('promo-3', 'Tudo de Graça', 100, periodoValido, jogosValidos);
   }).toThrow('Desconto deve ser entre 0 e 100.');
});

// --- CENÁRIO 3: Validação da Regra de Jogos (A regra nova que você criou) ---
it('deve lançar erro se a lista de jogos estiver vazia', () => {
   expect(() => {
   new Promocao('promo-4', 'Promo Fantasma', 20, periodoValido, []);
   }).toThrow('A promoção deve incluir pelo menos um jogo.');
});

// --- CENÁRIO 4: Comportamento de Validação de Tempo ---
it('validacao() deve retornar true se a data atual estiver dentro do período', () => {
   const promocao = new Promocao('promo-5', 'Halloween', 20, periodoValido, jogosValidos);
   
   expect(promocao.validacao()).toBe(true);
});

// --- CENÁRIO 5: Mudança de Estado Interno ---
it('validacao() deve retornar false se a promoção for desativada manualmente', () => {
   const promocao = new Promocao('promo-6', 'Promo Cancelada', 10, periodoValido, jogosValidos);

   promocao.desativar(); // Chama o seu método novo

   expect(promocao.validacao()).toBe(false);
   expect(promocao.ativa).toBe(false);
});
});