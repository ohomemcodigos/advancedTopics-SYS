import { Pagamento } from './pagamento.entity';
import { MetodoPagamento } from '../objetos_de_valor/metodo_pagamento';
import { Dinheiro } from '../objetos_de_valor/dinheiro';
import { Recibo } from '../objetos_de_valor/recibo';
import { describe, it, expect } from '@jest/globals';

describe('Pagamento', () => {
    it('deve associar um pagamento a um pedido especifico', () => {
        const metodo: MetodoPagamento = new MetodoPagamento('Pix', 'Chave Aleatoria');
        const valorTransacao: Dinheiro = new Dinheiro(199.90, 'BRL');

        const pagamento: Pagamento = new Pagamento('PAG-001', 'PED-001', metodo, valorTransacao);

        expect(pagamento.id).toBe('PAG-001');
        expect(pagamento.pedidoId).toBe('PED-001');
    });

    it('deve registrar o metodo de pagamento e o valor', () => {
        const metodo: MetodoPagamento = new MetodoPagamento('Cartão de Crédito', 'Token123');
        const valorTransacao: Dinheiro = new Dinheiro(250.00, 'USD');

        expect(metodo.tipoPagamento).toBe('Cartão de Crédito');
        expect(valorTransacao.valor).toBe(250.00);
        expect(valorTransacao.moeda).toBe('USD');
    });

    it('deve gerar um recibo com comprovante', () => {
        const dataAtual: Date = new Date();
        const recibo: Recibo = new Recibo(dataAtual, 'COMPROVANTE-999');

        expect(recibo.dataProcessamento).toBe(dataAtual);
        expect(recibo.comprovante).toBe('COMPROVANTE-999');
    });
});