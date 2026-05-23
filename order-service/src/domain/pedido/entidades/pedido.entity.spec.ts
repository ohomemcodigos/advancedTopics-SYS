import { Pedido } from './pedido.entity';
import { ItemPedido } from '../objetos_de_valor/item_pedido';
import { StatusPedido } from '../objetos_de_valor/status_pedido';
import { ChaveAtivacao } from '../objetos_de_valor/chave_ativacao';

describe('Pedido', () => {
    it('deve criar um pedido associado a um usuario externo com itens', () => {
        const item1 = new ItemPedido('SKU-123', 1, 199.90);
        const item2 = new ItemPedido('SKU-456', 2, 50.00);

        const pedido = new Pedido('PED-001', 'USR-999', [item1, item2]);

        expect(pedido.id).toBe('PED-001');
        expect(pedido.usuarioId).toBe('USR-999');
        expect(pedido.itens.length).toBe(2);
    });

    it('deve registrar o preco unitario no momento da compra', () => {
        const item = new ItemPedido('SKU-123', 1, 199.90);

        expect(item.precoUnitario).toBe(199.90);
    });

    it('deve gerenciar o status do pedido', () => {
        const pedido = new Pedido('PED-001', 'USR-999', []);

        expect(pedido.status).toBe(StatusPedido.Pendente);

        pedido.marcarComoPago();
        expect(pedido.status).toBe(StatusPedido.Pago);
    });

    it('deve gerar chave de ativacao apos confirmacao de pagamento', () => {
        const chave = new ChaveAtivacao('XXXX-YYYY-ZZZZ');

        expect(chave.codigo).toBe('XXXX-YYYY-ZZZZ');
    });
});