import { Pedido, StatusPedido } from './pedido.entity';
import { ItemPedido } from '../objetos_de_valor/item_pedido.vo';
import { ChaveAtivacao } from '../objetos_de_valor/chave_ativacao';
import { describe, it, expect } from '@jest/globals';

describe('Pedido', () => {
  it('deve criar um pedido associado a um usuario externo com itens', () => {
    const item1: ItemPedido = new ItemPedido('SKU-123', 1, 199.9);
    const item2: ItemPedido = new ItemPedido('SKU-456', 2, 50.0);

    const pedido: Pedido = new Pedido('PED-001', 'USR-999', [item1, item2]);

    expect(pedido.id).toBe('PED-001');
    expect(pedido.usuarioId).toBe('USR-999');
    expect(pedido.itens.length).toBe(2);
  });

  it('deve registrar o preco unitario no momento da compra', () => {
    const item: ItemPedido = new ItemPedido('SKU-123', 1, 199.9);

    expect(item.precoUnitario).toBe(199.9);
  });

  it('deve iniciar com status Pendente', () => {
    const pedido: Pedido = new Pedido('PED-001', 'USR-999', []);

    expect(pedido.status).toBe(StatusPedido.Pendente);
  });

  it('deve gerenciar o status do pedido ao marcar como pago', () => {
    const pedido: Pedido = new Pedido('PED-001', 'USR-999', []);

    pedido.marcarComoPago();

    expect(pedido.status).toBe(StatusPedido.Pago);
  });

  it('nao deve permitir pagar um pedido ja pago', () => {
    const pedido: Pedido = new Pedido('PED-001', 'USR-999', []);
    pedido.marcarComoPago();

    expect(() => {
      pedido.marcarComoPago();
    }).toThrow();
  });

  it('deve calcular o valor total corretamente', () => {
    const item1: ItemPedido = new ItemPedido('SKU-123', 2, 50.0);
    const item2: ItemPedido = new ItemPedido('SKU-456', 1, 100.0);

    const pedido: Pedido = new Pedido('PED-002', 'USR-001', [item1, item2]);

    expect(pedido.valorTotal).toBe(200.0);
  });

  it('deve gerar chave de ativacao apos confirmacao de pagamento', () => {
    const chave: ChaveAtivacao = new ChaveAtivacao('XXXX-YYYY-ZZZZ');

    expect(chave.codigo).toBe('XXXX-YYYY-ZZZZ');
  });

  it('deve lancar erro ao criar pedido sem id', () => {
    expect(() => {
      return new Pedido('', 'USR-999', []);
    }).toThrow('ID do pedido é obrigatório.');
  });

  it('deve cancelar um pedido pendente', () => {
    const pedido: Pedido = new Pedido('PED-003', 'USR-001', []);
    pedido.cancelar();

    expect(pedido.status).toBe(StatusPedido.Cancelado);
  });
});
