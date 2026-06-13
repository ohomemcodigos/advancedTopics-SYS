/* eslint-disable */
import { Pagamento } from './pagamento.entity';
import { MetodoPagamento } from '../objetos_de_valor/metodo_pagamento.vo';
import { Dinheiro } from '../objetos_de_valor/dinheiro.vo';
import { Recibo } from '../objetos_de_valor/recibo.vo';
import { describe, it, expect } from '@jest/globals';

describe('Pagamento', () => {
  it('deve associar um pagamento a um pedido especifico', () => {
    const metodo = new MetodoPagamento('Pix', 'Chave Aleatoria');
    const valorTransacao = new Dinheiro(199.9, 'BRL');
    const pagamento = new Pagamento('PAG-001', 'PED-001', valorTransacao, metodo);

    expect(pagamento.id).toBe('PAG-001');
    expect(pagamento.pedidoId).toBe('PED-001');
  });

  it('deve registrar o metodo de pagamento e o valor', () => {
    const metodo = new MetodoPagamento('Cartão de Crédito', 'Token123');
    const valorTransacao = new Dinheiro(250.0, 'USD');

    expect(metodo.tipoPagamento).toBe('Cartão de Crédito');
    expect(valorTransacao.valor).toBe(250.0);
    expect(valorTransacao.moeda).toBe('USD');
  });

  it('deve gerar um recibo com comprovante', () => {
    const dataAtual = new Date();
    const recibo = new Recibo('COMPROVANTE-999', dataAtual, new Dinheiro(10, 'BRL'), new MetodoPagamento('Pix', 'X'));

    expect(recibo.dataProcessamento).toBe(dataAtual);
    expect(recibo.comprovante).toBe('COMPROVANTE-999');
  });
});