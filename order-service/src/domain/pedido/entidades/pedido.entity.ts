import { ItemPedido } from '../objetos_de_valor/item_pedido.vo';

export enum StatusPedido {
  Pendente = 'Pendente',
  Pago = 'Pago',
  Processando = 'Processando',
  Enviado = 'Enviado',
  Entregue = 'Entregue',
  Cancelado = 'Cancelado',
}

export class Pedido {
  public readonly id: string;
  public readonly usuarioId: string;
  public readonly dataPedido: Date;
  public itens: ItemPedido[];
  public status: StatusPedido;

  constructor(
    id: string,
    usuarioId: string,
    itens: ItemPedido[],
    dataPedido?: Date,
  ) {
    if (!id) {
      throw new Error('ID do pedido é obrigatório.');
    }
    if (!usuarioId) {
      throw new Error('ID do usuário é obrigatório.');
    }

    this.id = id;
    this.usuarioId = usuarioId;
    this.itens = itens;
    this.dataPedido = dataPedido ?? new Date();
    this.status = StatusPedido.Pendente;
  }

  public marcarComoPago(): void {
    if (this.status !== StatusPedido.Pendente) {
      throw new Error(
        `Não é possível pagar um pedido com status "${this.status}".`,
      );
    }
    this.status = StatusPedido.Pago;
  }

  public cancelar(): void {
    if (this.status === StatusPedido.Entregue) {
      throw new Error('Não é possível cancelar um pedido já entregue.');
    }
    this.status = StatusPedido.Cancelado;
  }

  public get valorTotal(): number {
    return this.itens.reduce<number>(
      (total: number, item: ItemPedido): number => {
        // Como é um jogo digital, basta somar o preço unitário
        return total + Number(item.precoUnitario);
      },
      0,
    );
  }
}
