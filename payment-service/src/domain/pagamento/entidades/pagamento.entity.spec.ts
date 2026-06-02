import { Pagamento } from './pagamento.entity';
import { MetodoPagamento } from '../objetos_de_valor/metodo_pagamento.vo';
import { Dinheiro } from '../objetos_de_valor/dinheiro.vo';
import { Recibo } from '../objetos_de_valor/recibo.vo';

describe('Pagamento', () => {
  it('deve associar um pagamento a um pedido especifico', () => {
    const metodo = new MetodoPagamento('Pix', 'Chave Aleatoria');
    const valorTransacao = new Dinheiro(199.90, 'BRL');

    // Ordem correta: pagamentoId, pedidoId, valorTotal, MetodoPagamento
    const pagamento = new Pagamento('PAG-001', 'PED-001', valorTransacao, metodo);

    expect(pagamento.pagamentoId).toBe('PAG-001');
    expect(pagamento.pedidoId).toBe('PED-001');
  });

  it('deve registrar o metodo de pagamento e o valor', () => {
    const metodo = new MetodoPagamento('Cartão de Crédito', 'Token123');
    const valorTransacao = new Dinheiro(250.00, 'USD');

    // 'tipo' é o campo correto na entidade MetodoPagamento
    expect(metodo.tipo).toBe('Cartão de Crédito');
    expect(valorTransacao.valor).toBe(250.00);
    expect(valorTransacao.moeda).toBe('USD');
  });

  it('deve gerar um recibo com comprovante', () => {
    const dataAtual = new Date();
    const dinheiro = new Dinheiro(100, 'BRL');
    const metodo = new MetodoPagamento('Pix', 'chave@pix');
    // Ordem correta: numeroRecibo, dataEmissao, valorTotal, metodoPagamento
    const recibo = new Recibo('COMPROVANTE-999', dataAtual, dinheiro, metodo);

    expect(recibo.dataEmissao).toBe(dataAtual);
    expect(recibo.numeroRecibo).toBe('COMPROVANTE-999');
  });
});
